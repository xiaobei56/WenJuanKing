import React from 'react';
import { Result, Button, Typography } from 'antd';
import { Link } from 'react-router-dom';

const { Paragraph, Text } = Typography;

const AnswerSuccessPage: React.FC = () => {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <Result
        status="success"
        title="提交成功！"
        subTitle="感谢您的参与，您的答案已提交"
        extra={[
          <Link to="/" key="home">
            <Button type="primary">返回首页</Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default AnswerSuccessPage;