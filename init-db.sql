-- =========================================================
-- INIT DATABASE - Health & Fitness App
-- =========================================================

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================
-- 1. CORE & AUTHENTICATION
-- =========================================================

CREATE TABLE IF NOT EXISTS users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    gender_code VARCHAR(1) CHECK (gender_code IN ('M', 'F', 'O')),
    created_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    role_code VARCHAR(10) DEFAULT 'USER' CHECK (role_code IN ('ADMIN', 'USER', 'COACH'))
);

CREATE TABLE IF NOT EXISTS health_goal (
    goal_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    label VARCHAR(100) NOT NULL,
    description TEXT
);

CREATE TABLE IF NOT EXISTS user_profile (
    profile_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    height_cm INTEGER,
    current_weight_kg DECIMAL(5,2),
    activity_level_ref VARCHAR(50),
    health_goal_id UUID REFERENCES health_goal(goal_id),
    allergies_json JSONB DEFAULT '[]',
    preferences_json JSONB DEFAULT '{}',
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =========================================================
-- 2. SUBSCRIPTION & BILLING
-- =========================================================

CREATE TABLE IF NOT EXISTS subscription_plan (
    plan_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    duration_months INTEGER NOT NULL,
    features_json JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS subscription (
    subscription_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plan(plan_id),
    start_date DATE NOT NULL,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'EXPIRED', 'CANCELLED')),
    auto_renew BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS invoice (
    invoice_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscription(subscription_id),
    issued_at TIMESTAMP DEFAULT NOW(),
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PAID', 'PENDING')),
    pdf_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS payment_transaction (
    transaction_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    processed_at TIMESTAMP DEFAULT NOW(),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('CARD', 'PAYPAL')),
    transaction_ref_ext VARCHAR(255),
    status VARCHAR(20) DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED'))
);

-- =========================================================
-- 3. NUTRITION DOMAIN
-- =========================================================

CREATE TABLE IF NOT EXISTS food (
    food_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100),
    calories_100g DECIMAL(8,2),
    protein_100g DECIMAL(8,2),
    carbs_100g DECIMAL(8,2),
    fat_100g DECIMAL(8,2),
    nutriscore VARCHAR(1) CHECK (nutriscore IN ('A', 'B', 'C', 'D', 'E')),
    category_ref VARCHAR(100),
    fiber_g DECIMAL(8,2),
    sugar_g DECIMAL(8,2),
    sodium_mg DECIMAL(8,2),
    cholesterol_mg DECIMAL(8,2)
);

CREATE TABLE IF NOT EXISTS recipe (
    recipe_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    prep_time_min INTEGER,
    difficulty VARCHAR(10) CHECK (difficulty IN ('EASY', 'MEDIUM', 'HARD')),
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS recipe_ingredient (
    link_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipe_id UUID NOT NULL REFERENCES recipe(recipe_id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES food(food_id) ON DELETE CASCADE,
    quantity_grams DECIMAL(8,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS food_diary_entry (
    entry_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    food_id UUID NOT NULL REFERENCES food(food_id),
    consumed_at TIMESTAMP DEFAULT NOW(),
    quantity_grams DECIMAL(8,2) NOT NULL,
    meal_type VARCHAR(20) CHECK (meal_type IN ('BREAKFAST', 'LUNCH', 'DINNER', 'SNACK')),
    calories_consumed DECIMAL(8,2)
);

-- =========================================================
-- 4. PHYSICAL ACTIVITY DOMAIN
-- =========================================================

CREATE TABLE IF NOT EXISTS activity_type (
    activity_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    met_value DECIMAL(5,2),
    icon_url VARCHAR(500)
);

CREATE TABLE IF NOT EXISTS exercise (
    exercise_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    body_part_target VARCHAR(100),
    video_url VARCHAR(500),
    description TEXT,
    difficulty_level VARCHAR(20),
    equipment_required VARCHAR(255),
    category VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS workout_session (
    session_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    activity_id UUID REFERENCES activity_type(activity_id),
    start_time TIMESTAMP DEFAULT NOW(),
    duration_minutes INTEGER,
    calories_burned DECIMAL(8,2),
    distance_km DECIMAL(8,2),
    notes TEXT
);

CREATE TABLE IF NOT EXISTS session_detail (
    detail_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES workout_session(session_id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES exercise(exercise_id),
    sets INTEGER,
    reps INTEGER,
    weight_kg DECIMAL(6,2)
);

-- =========================================================
-- 5. HEALTH IOT & AI
-- =========================================================

CREATE TABLE IF NOT EXISTS connected_device (
    device_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    device_name VARCHAR(100),
    device_type VARCHAR(20) CHECK (device_type IN ('WATCH', 'SCALE', 'APP')),
    last_sync TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS biometric_measure (
    measure_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type VARCHAR(50) CHECK (type IN ('HEART_RATE', 'WEIGHT', 'SLEEP', 'STEPS')),
    value DECIMAL(10,2) NOT NULL,
    measured_at TIMESTAMP DEFAULT NOW(),
    source_device_id UUID REFERENCES connected_device(device_id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS ai_recommendation (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    generated_at TIMESTAMP DEFAULT NOW(),
    category VARCHAR(20) CHECK (category IN ('NUTRITION', 'SPORT', 'WELLNESS')),
    title VARCHAR(255),
    content_text TEXT,
    confidence_score DECIMAL(5,4),
    is_viewed BOOLEAN DEFAULT FALSE,
    feedback_rating VARCHAR(20) CHECK (feedback_rating IN ('THUMBS_UP', 'THUMBS_DOWN'))
);

-- =========================================================
-- 6. PROGRESS TRACKING
-- =========================================================

CREATE TABLE IF NOT EXISTS progress_tracker (
    progress_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    tracking_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    weekly_workouts_count INTEGER,
    weekly_calories_avg DECIMAL(10,2),
    goal_achievement_json JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_metrics (
    metric_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    recorded_date DATE NOT NULL,
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(5,2),
    steps INTEGER,
    calories_burned DECIMAL(8,2),
    heart_rate_avg INTEGER,
    heart_rate_max INTEGER,
    sleep_hours DECIMAL(4,2),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS diet_recommendation (
    recommendation_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    meal_type VARCHAR(20),
    recommended_foods JSONB DEFAULT '[]',
    total_calories DECIMAL(8,2),
    protein_g DECIMAL(8,2),
    carbs_g DECIMAL(8,2),
    fat_g DECIMAL(8,2),
    diet_type VARCHAR(50),
    generated_at TIMESTAMP DEFAULT NOW(),
    is_followed BOOLEAN DEFAULT FALSE
);

-- =========================================================
-- 7. ETL METADATA
-- =========================================================

CREATE TABLE IF NOT EXISTS data_source (
    source_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50),
    source_url VARCHAR(500),
    format VARCHAR(50),
    expected_records INTEGER,
    last_updated TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS etl_execution (
    execution_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    source_id UUID REFERENCES data_source(source_id) ON DELETE CASCADE,
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    status VARCHAR(20),
    records_extracted INTEGER DEFAULT 0,
    records_loaded INTEGER DEFAULT 0,
    records_rejected INTEGER DEFAULT 0,
    error_message TEXT,
    triggered_by VARCHAR(100)
);

CREATE TABLE IF NOT EXISTS data_quality_check (
    check_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES etl_execution(execution_id) ON DELETE CASCADE,
    target_table VARCHAR(100),
    check_type VARCHAR(50),
    check_rule TEXT,
    records_checked INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    failure_rate DECIMAL(5,4),
    checked_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS data_anomaly (
    anomaly_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    execution_id UUID REFERENCES etl_execution(execution_id) ON DELETE CASCADE,
    check_id UUID REFERENCES data_quality_check(check_id) ON DELETE CASCADE,
    source_table VARCHAR(100),
    anomaly_type VARCHAR(50),
    field_name VARCHAR(100),
    record_identifier VARCHAR(255),
    original_value TEXT,
    detected_at TIMESTAMP DEFAULT NOW(),
    severity VARCHAR(20),
    is_resolved BOOLEAN DEFAULT FALSE,
    resolution_action TEXT
);

-- =========================================================
-- INDEX POUR PERFORMANCE
-- =========================================================

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profile_user_id ON user_profile(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_user_id ON subscription(user_id);
CREATE INDEX IF NOT EXISTS idx_food_diary_user_id ON food_diary_entry(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_session_user_id ON workout_session(user_id);
CREATE INDEX IF NOT EXISTS idx_biometric_measure_user_id ON biometric_measure(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_tracker_user_id ON progress_tracker(user_id);

-- =========================================================
-- DONNÉES DE TEST (HEALTH GOALS)
-- =========================================================

INSERT INTO health_goal (goal_id, label, description) VALUES
    (uuid_generate_v4(), 'Perte de poids', 'Objectif de réduction du poids corporel'),
    (uuid_generate_v4(), 'Prise de masse', 'Objectif de gain de masse musculaire'),
    (uuid_generate_v4(), 'Maintien', 'Maintenir son poids et sa forme actuels'),
    (uuid_generate_v4(), 'Remise en forme', 'Amélioration générale de la condition physique'),
    (uuid_generate_v4(), 'Performance sportive', 'Optimisation des performances athlétiques')
ON CONFLICT DO NOTHING;

-- =========================================================
-- DONNÉES DE TEST (SUBSCRIPTION PLANS)
-- =========================================================

INSERT INTO subscription_plan (plan_id, name, monthly_price, duration_months, features_json, is_active) VALUES
    (uuid_generate_v4(), 'Free', 0.00, 1, '{"features": ["Basic tracking", "Limited recipes"]}', TRUE),
    (uuid_generate_v4(), 'Silver', 9.99, 1, '{"features": ["Full tracking", "All recipes", "Basic AI recommendations"]}', TRUE),
    (uuid_generate_v4(), 'Gold', 19.99, 1, '{"features": ["Full tracking", "All recipes", "Advanced AI", "Personal coach", "Priority support"]}', TRUE)
ON CONFLICT DO NOTHING;

-- =========================================================
-- DONNÉES DE TEST (ACTIVITY TYPES)
-- =========================================================

INSERT INTO activity_type (activity_id, name, met_value, icon_url) VALUES
    (uuid_generate_v4(), 'Running', 9.8, NULL),
    (uuid_generate_v4(), 'Cycling', 7.5, NULL),
    (uuid_generate_v4(), 'Swimming', 8.0, NULL),
    (uuid_generate_v4(), 'Gym', 6.0, NULL),
    (uuid_generate_v4(), 'Yoga', 3.0, NULL),
    (uuid_generate_v4(), 'Walking', 3.5, NULL),
    (uuid_generate_v4(), 'HIIT', 12.0, NULL)
ON CONFLICT DO NOTHING;

SELECT 'Database initialized successfully!' AS status;
