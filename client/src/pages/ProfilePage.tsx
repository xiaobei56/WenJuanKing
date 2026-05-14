import React, { useState } from 'react';
import { Card, Form, Input, Button, Upload, Avatar, message, Row, Col, Divider, List } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CameraOutlined } from '@ant-design/icons';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/auth';

const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const handleUpdateProfile = async (values: any) => {
    setLoading(true);
    try {
      // Simulated API call - in real app would call user update API
      updateUser({ ...user!, ...values });
      message.success('更新成功');
    } catch (err) {
      message.error('更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (info: any) => {
    if (info.file.status === 'done') {
      const url = info.file.response?.url;
      updateUser({ ...user!, avatar: url });
      message.success('头像更新成功');
    }
  };

  return (
    <Row gutter={[24, 24]}>
      <Col xs={24} md={8}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Upload
              showUploadList={false}
              action="/api/v1/upload"
              onChange={handleAvatarUpload}
            >
              <Avatar
                size={120}
                src={user?.avatar}
                icon={<UserOutlined />}
                style={{ cursor: 'pointer' }}
              />
            </Upload>
            <h3 style={{ marginTop: 16 }}>{user?.nickname || user?.username}</h3>
            <p style={{ color: '#999' }}>@{user?.username}</p>
          </div>

          <Divider />

          <List size="small">
            <List.Item>
              <MailOutlined style={{ marginRight: 8 }} />
              {user?.email || '未设置'}
            </List.Item>
            <List.Item>
              <PhoneOutlined style={{ marginRight: 8 }} />
              {user?.phone || '未设置'}
            </List.Item>
          </List>
        </Card>
      </Col>

      <Col xs={24} md={16}>
        <Card title="个人资料">
          <Form
            form={form}
            layout="vertical"
            initialValues={{
              nickname: user?.nickname,
              email: user?.email,
              phone: user?.phone,
            }}
            onFinish={handleUpdateProfile}
          >
            <Form.Item label="昵称" name="nickname" rules={[{ required: true }]}>
              <Input placeholder="请输入昵称" />
            </Form.Item>

            <Form.Item label="邮箱" name="email" rules={[{ type: 'email' }]}>
              <Input placeholder="请输入邮箱" />
            </Form.Item>

            <Form.Item label="手机号" name="phone">
              <Input placeholder="请输入手机号" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
            </Form.Item>
          </Form>
        </Card>

        <Card title="修改密码" style={{ marginTop: 24 }}>
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
            <Form.Item>
              <Button type="primary">修改密码</Button>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default ProfilePage;