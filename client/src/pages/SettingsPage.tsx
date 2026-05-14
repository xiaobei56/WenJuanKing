import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Divider, Select, Switch, Space, Tabs } from 'antd';
import { useThemeStore, PRESET_COLORS } from '../store/theme';

const { Title, Text } = Typography;

const ThemeSettings: React.FC = () => {
  const { theme, primaryColor, setTheme, setPrimaryColor } = useThemeStore();
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      // Simulated save
      message.success('主题设置已保存');
    } catch (err) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="主题设置">
      <Form layout="vertical">
        <Form.Item label="主题模式">
          <Select
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'light', label: '浅色模式' },
              { value: 'dark', label: '深色模式' },
              { value: 'auto', label: '跟随系统' },
            ]}
          />
        </Form.Item>

        <Form.Item label="主题色">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {PRESET_COLORS.map((color) => (
              <div
                key={color}
                onClick={() => setPrimaryColor(color)}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 4,
                  backgroundColor: color,
                  cursor: 'pointer',
                  border: primaryColor === color ? '2px solid #000' : '2px solid transparent',
                  boxSizing: 'border-box',
                }}
              />
            ))}
            <Input
              type="color"
              value={primaryColor}
              onChange={(e) => setPrimaryColor(e.target.value)}
              style={{ width: 32, height: 32, padding: 0 }}
            />
          </div>
        </Form.Item>

        <Form.Item>
          <Button type="primary" onClick={handleSave} loading={loading}>
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const GeneralSettings: React.FC = () => {
  const [form] = Form.useForm();

  const handleSave = async () => {
    message.success('保存成功');
  };

  return (
    <Card title="通用设置">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          siteName: 'SurveyKing',
          siteDescription: '开源问卷/考试系统',
          timezone: 'Asia/Shanghai',
          language: 'zh-CN',
        }}
        onFinish={handleSave}
      >
        <Form.Item label="网站名称" name="siteName">
          <Input placeholder="请输入网站名称" />
        </Form.Item>

        <Form.Item label="网站描述" name="siteDescription">
          <Input.TextArea rows={3} placeholder="请输入网站描述" />
        </Form.Item>

        <Form.Item label="时区" name="timezone">
          <Select
            options={[
              { value: 'Asia/Shanghai', label: '中国时区 (UTC+8)' },
              { value: 'America/New_York', label: '美国东部 (UTC-5)' },
              { value: 'Europe/London', label: '英国 (UTC+0)' },
            ]}
          />
        </Form.Item>

        <Form.Item label="语言" name="language">
          <Select
            options={[
              { value: 'zh-CN', label: '简体中文' },
              { value: 'zh-TW', label: '繁体中文' },
              { value: 'en-US', label: 'English' },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            保存设置
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

const NotificationSettings: React.FC = () => (
  <Card title="通知设置">
    <Form layout="vertical">
      <Form.Item label="邮件通知">
        <Switch defaultChecked />
      </Form.Item>

      <Form.Item label="有新答卷时邮件通知">
        <Switch defaultChecked />
      </Form.Item>

      <Form.Item label="系统公告通知">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary">保存设置</Button>
      </Form.Item>
    </Form>
  </Card>
);

const SecuritySettings: React.FC = () => (
  <Card title="安全设置">
    <Form layout="vertical">
      <Form.Item label="当前密码" required>
        <Input.Password placeholder="请输入当前密码" />
      </Form.Item>

      <Form.Item label="新密码" required>
        <Input.Password placeholder="请输入新密码" />
      </Form.Item>

      <Form.Item label="确认密码" required>
        <Input.Password placeholder="请确认新密码" />
      </Form.Item>

      <Divider />

      <Form.Item label="双因素认证">
        <Switch />
        <div style={{ color: '#999', marginTop: 8 }}>
          启用双因素认证后，登录时需要输入手机验证码
        </div>
      </Form.Item>

      <Form.Item>
        <Button type="primary">更新密码</Button>
      </Form.Item>
    </Form>
  </Card>
);

const AdvancedSettings: React.FC = () => (
  <Card title="高级设置">
    <Form layout="vertical">
      <Form.Item label="数据保留天数">
        <Input type="number" defaultValue={365} style={{ width: 200 }} />
        <Text type="secondary" style={{ marginLeft: 8 }}>设置为 0 表示永久保留</Text>
      </Form.Item>

      <Form.Item label="单文件大小限制">
        <Select defaultValue="10" style={{ width: 200 }}>
          <Select.Option value="5">5MB</Select.Option>
          <Select.Option value="10">10MB</Select.Option>
          <Select.Option value="20">20MB</Select.Option>
          <Select.Option value="50">50MB</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item label="最大答卷数">
        <Input type="number" defaultValue={10000} style={{ width: 200 }} />
      </Form.Item>

      <Form.Item>
        <Button type="primary">保存设置</Button>
      </Form.Item>
    </Form>
  </Card>
);

const SettingsPage: React.FC = () => {
  return (
    <div>
      <Title level={2}>系统设置</Title>
      <Tabs
        items={[
          { key: 'theme', label: '主题设置', children: <ThemeSettings /> },
          { key: 'general', label: '通用设置', children: <GeneralSettings /> },
          { key: 'notification', label: '通知设置', children: <NotificationSettings /> },
          { key: 'security', label: '安全设置', children: <SecuritySettings /> },
          { key: 'advanced', label: '高级设置', children: <AdvancedSettings /> },
        ]}
      />
    </div>
  );
};

export default SettingsPage;