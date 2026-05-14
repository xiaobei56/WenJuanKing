import React, { useState } from 'react';
import { Card, Form, Input, Switch, Select, Button, Divider, message, Tabs, Row, Col } from 'antd';
import { useAuthStore } from '../store/auth';

const SettingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleSaveGeneral = async (values: any) => {
    setLoading(true);
    try {
      message.success('保存成功');
    } catch (err) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotification = async (values: any) => {
    setLoading(true);
    try {
      message.success('保存成功');
    } catch (err) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSecurity = async (values: any) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      message.success('保存成功');
    } catch (err) {
      message.error('保存失败');
    } finally {
      setLoading(false);
    }
  };

  const GeneralSettings = () => (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        siteName: 'SurveyKing',
        siteDescription: '开源问卷/考试系统',
        timezone: 'Asia/Shanghai',
        language: 'zh-CN',
      }}
      onFinish={handleSaveGeneral}
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
        <Button type="primary" htmlType="submit" loading={loading}>
          保存设置
        </Button>
      </Form.Item>
    </Form>
  );

  const NotificationSettings = () => (
    <Form
      layout="vertical"
      initialValues={{
        emailNotify: true,
        answerNotify: true,
        systemNotify: false,
      }}
      onFinish={handleSaveNotification}
    >
      <Form.Item label="邮件通知" name="emailNotify" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item label="有新答卷时邮件通知" name="answerNotify" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item label="系统公告通知" name="systemNotify" valuePropName="checked">
        <Switch />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          保存设置
        </Button>
      </Form.Item>
    </Form>
  );

  const SecuritySettings = () => (
    <Form
      layout="vertical"
      onFinish={handleSaveSecurity}
    >
      <Form.Item label="当前密码" name="currentPassword" required>
        <Input.Password placeholder="请输入当前密码" />
      </Form.Item>

      <Form.Item label="新密码" name="newPassword" required>
        <Input.Password placeholder="请输入新密码" />
      </Form.Item>

      <Form.Item label="确认密码" name="confirmPassword" required>
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
        <Button type="primary" htmlType="submit" loading={loading}>
          更新密码
        </Button>
      </Form.Item>
    </Form>
  );

  return (
    <div>
      <h2>系统设置</h2>
      <Card>
        <Tabs
          items={[
            { key: 'general', label: '通用设置', children: <GeneralSettings /> },
            { key: 'notification', label: '通知设置', children: <NotificationSettings /> },
            { key: 'security', label: '安全设置', children: <SecuritySettings /> },
          ]}
        />
      </Card>
    </div>
  );
};

export default SettingsPage;