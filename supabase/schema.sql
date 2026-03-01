-- Labor App Database Schema
-- Supabase PostgreSQL Database Setup

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- CORE TABLES
-- ============================================

-- Profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('candidate', 'client', 'admin')) DEFAULT 'candidate',
    profile_id VARCHAR(5) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    profile_picture_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sessions table for unique session management
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id VARCHAR(64) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE
);

-- Page Registry for role-based page access
CREATE TABLE IF NOT EXISTS page_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_id VARCHAR(5) UNIQUE NOT NULL,
    page_name VARCHAR(100) NOT NULL,
    path VARCHAR(255) NOT NULL,
    allowed_roles VARCHAR[] NOT NULL DEFAULT ARRAY['candidate', 'client', 'admin'],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- File Registry for tracking all application files
CREATE TABLE IF NOT EXISTS file_registry (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id VARCHAR(5) UNIQUE NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    functionality TEXT NOT NULL,
    connection TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- TASKS & TRAINING TABLES
-- ============================================

-- Tasks table for admin-assigned tasks
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id VARCHAR(5) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    task_type VARCHAR(20) NOT NULL CHECK (task_type IN ('upload', 'form', 'video', 'text', 'training')),
    assigned_to UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
    due_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Task submissions
CREATE TABLE IF NOT EXISTS task_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id VARCHAR(5) UNIQUE NOT NULL,
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    content JSONB,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Trainings (video/text content)
CREATE TABLE IF NOT EXISTS trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id VARCHAR(5) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    content_type VARCHAR(20) NOT NULL CHECK (content_type IN ('video', 'text')),
    content_url TEXT,
    content_text TEXT,
    duration_seconds INTEGER,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User trainings (assignment tracking)
CREATE TABLE IF NOT EXISTS user_trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    progress_percentage 0,
    INTEGER NOT NULL DEFAULT completed_at TIMESTAMPTZ,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, training_id)
);

-- ============================================
-- DOCUMENTATION STAGES
-- ============================================

-- Documentation stages (timer stages)
CREATE TABLE IF NOT EXISTS documentation_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    stage_id VARCHAR(5) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User documentation progress
CREATE TABLE IF NOT EXISTS user_documentation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    stage_id UUID NOT NULL REFERENCES documentation_stages(id) ON DELETE CASCADE,
    current_stage VARCHAR(100) NOT NULL,
    notes TEXT,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id)
);

-- ============================================
-- POLICIES & LEGAL
-- ============================================

-- Policies table
CREATE TABLE IF NOT EXISTS policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    policy_id VARCHAR(5) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100) NOT NULL,
    state_code VARCHAR(2),
    federal BOOLEAN NOT NULL DEFAULT FALSE,
    created_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User policy assignments
CREATE TABLE IF NOT EXISTS user_policies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    policy_id UUID NOT NULL REFERENCES policies(id) ON DELETE CASCADE,
    is_acknowledged BOOLEAN NOT NULL DEFAULT FALSE,
    acknowledged_at TIMESTAMPTZ,
    assigned_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, policy_id)
);

-- Legal references (federal/state laws)
CREATE TABLE IF NOT EXISTS legal_references (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_id VARCHAR(5) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    state_code VARCHAR(2),
    federal BOOLEAN NOT NULL DEFAULT FALSE,
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- User legal data
CREATE TABLE IF NOT EXISTS user_legal_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    legal_data JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- CONTRACTS & REQUESTS
-- ============================================

-- Contracts
CREATE TABLE IF NOT EXISTS contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    contract_id VARCHAR(5) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    pdf_url TEXT NOT NULL,
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    candidate_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ
);

-- Employer requests
CREATE TABLE IF NOT EXISTS employer_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id VARCHAR(5) UNIQUE NOT NULL,
    employer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'filled', 'cancelled')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Candidate recommendations
CREATE TABLE IF NOT EXISTS candidate_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recommendation_id VARCHAR(5) UNIQUE NOT NULL,
    candidate_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    recommended_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================
-- UPLOADS
-- ============================================

-- User uploads
CREATE TABLE IF NOT EXISTS user_uploads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    upload_id VARCHAR(5) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    upload_type VARCHAR(20) NOT NULL CHECK (upload_type IN ('profile', 'document', 'contract')),
    file_url TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- ============================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_registry ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentation_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_documentation ENABLE ROW LEVEL SECURITY;
ALTER TABLE policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE legal_references ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_legal_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE candidate_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_uploads ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Profiles are viewable by owner and admins" ON profiles
    FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles p2 WHERE p2.user_id = auth.uid() AND p2.role = 'admin'));

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can insert profiles" ON profiles
    FOR INSERT WITH CHECK (TRUE);

-- Sessions policies
CREATE POLICY "Users can manage own sessions" ON sessions
    FOR ALL USING (auth.uid() = user_id);

-- Page registry - readable by all authenticated users
CREATE POLICY "Page registry is viewable by all" ON page_registry
    FOR SELECT USING (TRUE);

-- File registry - readable by all authenticated users
CREATE POLICY "File registry is viewable by all" ON file_registry
    FOR SELECT USING (TRUE);

-- Tasks policies
CREATE POLICY "Users can view own tasks" ON tasks
    FOR SELECT USING (assigned_to = auth.uid() OR created_by = auth.uid());

CREATE POLICY "Admins can manage all tasks" ON tasks
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Task submissions policies
CREATE POLICY "Users can manage own submissions" ON task_submissions
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can review submissions" ON task_submissions
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Trainings - readable by all
CREATE POLICY "Trainings are viewable by all" ON trainings
    FOR SELECT USING (TRUE);

-- User trainings policies
CREATE POLICY "Users can manage own training progress" ON user_trainings
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can assign trainings" ON user_trainings
    FOR INSERT WITH CHECK (TRUE);

-- Documentation stages - readable by all
CREATE POLICY "Stages are viewable by all" ON documentation_stages
    FOR SELECT USING (TRUE);

-- User documentation policies
CREATE POLICY "Users can view own documentation" ON user_documentation
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can manage all documentation" ON user_documentation
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Policies - readable by all
CREATE POLICY "Policies are viewable by all" ON policies
    FOR SELECT USING (TRUE);

-- User policies policies
CREATE POLICY "Users can manage own policy acknowledgments" ON user_policies
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can assign policies" ON user_policies
    FOR INSERT WITH CHECK (TRUE);

-- Legal references - readable by all
CREATE POLICY "Legal references are viewable by all" ON legal_references
    FOR SELECT USING (TRUE);

-- User legal data policies
CREATE POLICY "Users can manage own legal data" ON user_legal_data
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can view all legal data" ON user_legal_data
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Contracts policies
CREATE POLICY "Users can view own contracts" ON contracts
    FOR SELECT USING (employer_id = auth.uid() OR candidate_id = auth.uid());

CREATE POLICY "Admins can manage all contracts" ON contracts
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Employer requests policies
CREATE POLICY "Users can view own requests" ON employer_requests
    FOR SELECT USING (employer_id = auth.uid());

CREATE POLICY "Admins can view all requests" ON employer_requests
    FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- Candidate recommendations policies
CREATE POLICY "Users can view own recommendations" ON candidate_recommendations
    FOR SELECT USING (candidate_id = auth.uid() OR recommended_by = auth.uid());

CREATE POLICY "Admins can manage all recommendations" ON candidate_recommendations
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- User uploads policies
CREATE POLICY "Users can manage own uploads" ON user_uploads
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Admins can review uploads" ON user_uploads
    FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- ============================================
-- FUNCTIONS
-- ============================================

-- Generate 5-character hex ID
CREATE OR REPLACE FUNCTION generate_hex_id(length INT DEFAULT 5)
RETURNS TEXT AS $$
BEGIN
    RETURN substring(md5(random()::text) FROM 1 FOR length);
END;
$$ LANGUAGE plpgsql;

-- Get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role FROM profiles WHERE user_id = $1;
    RETURN COALESCE(user_role, 'candidate');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Can access page function
CREATE OR REPLACE FUNCTION can_access_page(user_id UUID, page_path TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_role TEXT;
    allowed_roles TEXT[];
BEGIN
    user_role := get_user_role(user_id);
    
    SELECT pr.allowed_roles INTO allowed_roles
    FROM page_registry pr
    WHERE pr.path = page_path;
    
    IF allowed_roles IS NULL THEN
        RETURN TRUE;
    END IF;
    
    RETURN user_role = ANY(allowed_roles);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Validate session
CREATE OR REPLACE FUNCTION validate_session(session_id_input TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    valid_session BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM sessions 
        WHERE session_id = session_id_input 
        AND is_active = TRUE 
        AND expires_at > NOW()
    ) INTO valid_session;
    
    RETURN COALESCE(valid_session, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Register file
CREATE OR REPLACE FUNCTION register_file(
    file_id_input TEXT,
    file_name_input TEXT,
    description_input TEXT,
    functionality_input TEXT,
    connection_input TEXT
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO file_registry (file_id, file_name, description, functionality, connection)
    VALUES (file_id_input, file_name_input, description_input, functionality_input, connection_input)
    ON CONFLICT (file_id) DO UPDATE
    SET description = description_input,
        functionality = functionality_input,
        connection = connection_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create session
CREATE OR REPLACE FUNCTION create_user_session(user_id_input UUID)
RETURNS TEXT AS $$
DECLARE
    new_session_id TEXT;
    new_sess sessions;
BEGIN
    new_session_id := generate_hex_id(64);
    
    INSERT INTO sessions (session_id, user_id, expires_at)
    VALUES (new_session_id, user_id_input, NOW() + INTERVAL '7 days')
    RETURNING * INTO new_sess;
    
    RETURN new_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_profile_id TEXT;
BEGIN
    NEW.profile_id := generate_hex_id(5);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-creating profile
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- DEFAULT PAGE REGISTRY ENTRIES
-- ============================================

INSERT INTO page_registry (page_id, page_name, path, allowed_roles) VALUES
('HOME', 'Home', '/dashboard/home', ARRAY['candidate', 'client', 'admin']),
('CLAS', 'Classroom', '/dashboard/classroom', ARRAY['candidate', 'client', 'admin']),
('POLI', 'Policies', '/dashboard/policies', ARRAY['candidate', 'client', 'admin']),
('PROF', 'Profile', '/dashboard/profile', ARRAY['candidate', 'client', 'admin']),
('ADMP', 'Admin Panel', '/admin', ARRAY['admin'])
ON CONFLICT (page_id) DO NOTHING;

-- ============================================
-- DEFAULT DOCUMENTATION STAGES
-- ============================================

INSERT INTO documentation_stages (stage_id, name, description, order_index) VALUES
('DOCV', 'Document Validation', 'Verify uploaded documents', 1),
('BGCR', 'Background Check', 'Conduct background verification', 2),
('SKVL', 'Skill Validation', 'Verify skills and qualifications', 3),
('EDVL', 'Education Validation', 'Verify educational credentials', 4),
('VISA', 'Visa Expiration', 'Check visa and work authorization', 5)
ON CONFLICT (stage_id) DO NOTHING;
