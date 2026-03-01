-- ============================================
-- FIX: Drop existing policies first
-- ============================================

DROP POLICY IF EXISTS "Profiles are viewable by owner and admins" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON profiles;
DROP POLICY IF EXISTS "Users can manage own sessions" ON sessions;
DROP POLICY IF EXISTS "Page registry is viewable by all" ON page_registry;
DROP POLICY IF EXISTS "File registry is viewable by all" ON file_registry;
DROP POLICY IF EXISTS "Users can view own tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can manage all tasks" ON tasks;
DROP POLICY IF EXISTS "Users can manage own submissions" ON task_submissions;
DROP POLICY IF EXISTS "Admins can review submissions" ON task_submissions;
DROP POLICY IF EXISTS "Trainings are viewable by all" ON trainings;
DROP POLICY IF EXISTS "Users can manage own training progress" ON user_trainings;
DROP POLICY IF EXISTS "Admins can assign trainings" ON user_trainings;
DROP POLICY IF EXISTS "Stages are viewable by all" ON documentation_stages;
DROP POLICY IF EXISTS "Users can view own documentation" ON user_documentation;
DROP POLICY IF EXISTS "Admins can manage all documentation" ON user_documentation;
DROP POLICY IF EXISTS "Policies are viewable by all" ON policies;
DROP POLICY IF EXISTS "Users can manage own policy acknowledgments" ON user_policies;
DROP POLICY IF EXISTS "Admins can assign policies" ON user_policies;
DROP POLICY IF EXISTS "Legal references are viewable by all" ON legal_references;
DROP POLICY IF EXISTS "Users can manage own legal data" ON user_legal_data;
DROP POLICY IF EXISTS "Admins can view all legal data" ON user_legal_data;
DROP POLICY IF EXISTS "Users can view own contracts" ON contracts;
DROP POLICY IF EXISTS "Admins can manage all contracts" ON contracts;
DROP POLICY IF EXISTS "Users can view own requests" ON employer_requests;
DROP POLICY IF EXISTS "Admins can view all requests" ON employer_requests;
DROP POLICY IF EXISTS "Users can view own recommendations" ON candidate_recommendations;
DROP POLICY IF EXISTS "Admins can manage all recommendations" ON candidate_recommendations;
DROP POLICY IF EXISTS "Users can manage own uploads" ON user_uploads;
DROP POLICY IF EXISTS "Admins can review uploads" ON user_uploads;

-- ============================================
-- RLS POLICIES (Safe to run now)
-- ============================================

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
