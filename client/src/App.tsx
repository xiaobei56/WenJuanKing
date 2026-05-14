import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Dropdown, Avatar, Badge, Space, ConfigProvider, Tooltip } from 'antd';
import {
  HomeOutlined,
  ProjectOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  BellOutlined,
  DashboardOutlined,
  AppstoreOutlined,
  BgColorsOutlined,
} from '@ant-design/icons';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProjectListPage from './pages/ProjectListPage';
import ProjectEditPage from './pages/ProjectEditPage';
import ProjectViewPage from './pages/ProjectViewPage';
import SurveyPage from './pages/SurveyPage';
import AnswerSuccessPage from './pages/AnswerSuccessPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import TemplatesPage from './pages/TemplatesPage';
import SettingsPage from './pages/SettingsPage';
import { useAuthStore } from './store/auth';
import { useThemeStore, THEME_CONFIG, PRESET_COLORS } from './store/theme';
import { theme as antTheme } from 'antd';

const { Header, Content, Footer } = Layout;

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, primaryColor, setTheme, setPrimaryColor } = useThemeStore();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const cycleTheme = () => {
    const themes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex]);
  };

  const getThemeConfig = () => {
    if (theme === 'auto') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? THEME_CONFIG.dark : THEME_CONFIG.light;
    }
    return THEME_CONFIG[theme];
  };

  const themeConfig = getThemeConfig();

  const userMenu = (
    <Menu>
      <Menu.Item key="profile" icon={<UserOutlined />} onClick={() => navigate('/profile')}>
        个人中心
      </Menu.Item>
      <Menu.Item key="settings" icon={<SettingOutlined />} onClick={() => navigate('/settings')}>
        设置
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key="logout" icon={<LogoutOutlined />} onClick={handleLogout}>
        退出登录
      </Menu.Item>
    </Menu>
  );

  const headerMenu = (
    <Menu mode="horizontal" defaultSelectedKeys={['home']}>
      <Menu.Item key="home" icon={<HomeOutlined />}>
        <Link to="/">首页</Link>
      </Menu.Item>
      {isAuthenticated && (
        <>
          <Menu.Item key="dashboard" icon={<DashboardOutlined />}>
            <Link to="/dashboard">控制台</Link>
          </Menu.Item>
          <Menu.Item key="projects" icon={<ProjectOutlined />}>
            <Link to="/projects">项目管理</Link>
          </Menu.Item>
          <Menu.Item key="templates" icon={<AppstoreOutlined />}>
            <Link to="/templates">模板库</Link>
          </Menu.Item>
        </>
      )}
    </Menu>
  );

  return (
    <ConfigProvider
      theme={{
        algorithm: themeConfig.algorithm === 'dark' ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: {
          ...themeConfig.token,
          colorPrimary: primaryColor,
        },
      }}
    >
      <Layout className="layout" style={{ minHeight: '100vh' }}>
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
          <div style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>
            <Link to="/" style={{ color: '#fff' }}>SurveyKing v2</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {headerMenu}

            {isAuthenticated ? (
              <Space size="large" wrap>
                <Tooltip title={`主题: ${theme === 'light' ? '浅色' : theme === 'dark' ? '深色' : '自动'}`}>
                  <BgColorsOutlined
                    style={{ fontSize: 18, color: '#fff', cursor: 'pointer' }}
                    onClick={cycleTheme}
                  />
                </Tooltip>
                <Badge count={0}>
                  <BellOutlined style={{ fontSize: 18, color: '#fff', cursor: 'pointer' }} />
                </Badge>
                <Dropdown overlay={userMenu} placement="bottomRight">
                  <Space style={{ cursor: 'pointer' }}>
                    <Avatar size="small" icon={<UserOutlined />} src={user?.avatar} />
                    <span style={{ color: '#fff' }}>{user?.nickname || user?.username}</span>
                  </Space>
                </Dropdown>
              </Space>
            ) : (
              <Space wrap>
                <Link to="/login">
                  <span style={{ color: '#fff' }}>登录</span>
                </Link>
                <Link to="/register">
                  <span style={{ color: '#fff' }}>注册</span>
                </Link>
              </Space>
            )}
          </div>
        </Header>

        <Content style={{ padding: '0 50px', flex: 1 }}>
          <div style={{ padding: 24, minHeight: 380 }}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/survey/:id" element={<SurveyPage />} />
              <Route path="/answer/success" element={<AnswerSuccessPage />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/projects"
                element={
                  <ProtectedRoute>
                    <ProjectListPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project/new"
                element={
                  <ProtectedRoute>
                    <ProjectEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project/:id"
                element={
                  <ProtectedRoute>
                    <ProjectEditPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/project/:id/preview"
                element={
                  <ProtectedRoute>
                    <ProjectViewPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/templates"
                element={
                  <ProtectedRoute>
                    <TemplatesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
        </Content>

        <Footer style={{ textAlign: 'center' }}>
          SurveyKing v2 © 2025 - Built with Go + React + PostgreSQL
        </Footer>
      </Layout>
    </ConfigProvider>
  );
};

export default App;