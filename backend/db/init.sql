DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('administrator', 'teacher');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'reservation_status') THEN
        CREATE TYPE reservation_status AS ENUM ('active', 'cancelled');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'teacher',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS classrooms (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    capacity INT NOT NULL CHECK (capacity > 0),
    location VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(120) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS teacher_subjects (
    user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, subject_id) -- Evita que un profesor se asigne dos veces la misma materia
);

CREATE TABLE IF NOT EXISTS reservations (
    id SERIAL PRIMARY KEY,
    classroom_id INT NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
    subject_id INT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    user_id INT NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    date DATE NOT NULL CHECK (date >= CURRENT_DATE),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    status reservation_status NOT NULL DEFAULT 'active',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT chk_valid_hours CHECK (start_time < end_time)
);


CREATE INDEX IF NOT EXISTS idx_reservations_availability 
ON reservations (classroom_id, date) 
WHERE (status = 'active');

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

INSERT INTO users (name, email, password_hash, role) VALUES
('System Administrator', 'admin@university.edu', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkB1bml2ZXJzaXR5LmVkdSIsInJvbGUiOiJhZG1pbmlzdHJhdG9yIiwiaWF0IjoxNzgwNjkwMzUyLCJleHAiOjE3ODA2OTc1NTJ9.Xyrqa3UqEKN_uzFi7a_lNS1iji9ztkzUfu_Ij_eAaZM', 'administrator')
ON CONFLICT (email) DO NOTHING;

CREATE OR REPLACE FUNCTION sp_create_reservation( 
    p_classroom_id INT,
    p_subject_id INT,
    p_user_id INT,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME
) 
RETURNS INT AS $$
DECLARE
    v_reservation_id INT;
    v_conflict INT;
    v_user_role user_role;
    v_is_authorized BOOLEAN;
BEGIN
    SELECT role INTO v_user_role FROM users WHERE id = p_user_id;

    IF v_user_role = 'teacher' THEN
        SELECT EXISTS (
            SELECT 1 FROM teacher_subjects 
            WHERE user_id = p_user_id AND subject_id = p_subject_id
        ) INTO v_is_authorized;

        IF NOT v_is_authorized THEN
            RAISE EXCEPTION 'Access denied: You cannot reserve a classroom for a subject you do not teach.';
        END IF;
    END IF;

    PERFORM id FROM classrooms WHERE id = p_classroom_id FOR UPDATE;

    SELECT COUNT(*) INTO v_conflict
    FROM reservations
    WHERE classroom_id = p_classroom_id
      AND date = p_date
      AND status = 'active'
      AND (
          (p_start_time >= start_time AND p_start_time < end_time) OR
          (p_end_time > start_time AND p_end_time <= end_time) OR
          (p_start_time <= start_time AND p_end_time >= end_time)
      );

    IF v_conflict > 0 THEN
        RAISE EXCEPTION 'The classroom is already reserved within the requested time range.';
    END IF;

    INSERT INTO reservations (classroom_id, subject_id, user_id, date, start_time, end_time, status)
    VALUES (p_classroom_id, p_subject_id, p_user_id, p_date, p_start_time, p_end_time, 'active')
    RETURNING id INTO v_reservation_id;

    RETURN v_reservation_id;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION sp_modify_reservation(
    p_reservation_id INT,
    p_classroom_id INT,
    p_user_id INT,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME
) 
RETURNS VOID AS $$
DECLARE
    v_user_role user_role;
    v_owner_id INT;
    v_conflict INT;
BEGIN
    SELECT role INTO v_user_role FROM users WHERE id = p_user_id;
    SELECT user_id INTO v_owner_id FROM reservations WHERE id = p_reservation_id AND status = 'active';

    IF v_owner_id IS NULL THEN
        RAISE EXCEPTION 'Reservation not found or it is already cancelled.';
    END IF;

    IF v_user_role = 'teacher' AND p_user_id != v_owner_id THEN
        RAISE EXCEPTION 'Access denied: You can only modify your own reservations.';
    END IF;

    PERFORM id FROM classrooms WHERE id = p_classroom_id FOR UPDATE;

    SELECT COUNT(*) INTO v_conflict
    FROM reservations
    WHERE classroom_id = p_classroom_id
      AND date = p_date
      AND status = 'active'
      AND id != p_reservation_id
      AND (
          (p_start_time >= start_time AND p_start_time < end_time) OR
          (p_end_time > start_time AND p_end_time <= end_time) OR
          (p_start_time <= start_time AND p_end_time >= end_time)
      );

    IF v_conflict > 0 THEN
        RAISE EXCEPTION 'The classroom is already reserved within the requested time range.';
    END IF;

    UPDATE reservations 
    SET classroom_id = p_classroom_id,
        date = p_date,
        start_time = p_start_time,
        end_time = p_end_time,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_reservation_id;
END;
$$ LANGUAGE plpgsql;