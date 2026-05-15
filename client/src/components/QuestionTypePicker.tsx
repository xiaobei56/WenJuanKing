import React from 'react';
import { Modal, Card, Row, Col, Typography, Tag } from 'antd';
import {
  CheckOutlined, EditOutlined, AlignLeftOutlined,
  DownOutlined, MergeOutlined, CalendarOutlined, ClockCircleOutlined,
  SlidersOutlined, StarOutlined, SwitcherOutlined, UploadOutlined,
  CloudUploadOutlined, LinkOutlined, VideoCameraOutlined, AudioOutlined,
  EnvironmentOutlined, PhoneOutlined, NumberOutlined, DollarOutlined,
  BgColorsOutlined, StarTwoTone, FileTextOutlined, MinusOutlined,
  PaperClipOutlined, QuestionCircleOutlined, AccountBookOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface QuestionTypePickerProps {
  open: boolean;
  onSelect: (type: number) => void;
  onCancel: () => void;
}

const QUESTION_TYPES_CONFIG = [
  { value: 1, label: '单选', icon: <CheckOutlined />, color: '#1890ff', category: 'choice' },
  { value: 2, label: '多选', icon: <CheckOutlined />, color: '#1890ff', category: 'choice' },
  { value: 5, label: '下拉', icon: <DownOutlined />, color: '#1890ff', category: 'choice' },
  { value: 6, label: '多选下拉', icon: <MergeOutlined />, color: '#1890ff', category: 'choice' },
  { value: 3, label: '输入框', icon: <EditOutlined />, color: '#52c41a', category: 'input' },
  { value: 4, label: '文本域', icon: <AlignLeftOutlined />, color: '#52c41a', category: 'input' },
  { value: 26, label: '数字', icon: <NumberOutlined />, color: '#52c41a', category: 'input' },
  { value: 27, label: '货币', icon: <DollarOutlined />, color: '#52c41a', category: 'input' },
  { value: 25, label: '手机号', icon: <PhoneOutlined />, color: '#52c41a', category: 'input' },
  { value: 28, label: '网址', icon: <LinkOutlined />, color: '#52c41a', category: 'input' },
  { value: 8, label: '日期', icon: <CalendarOutlined />, color: '#722ed1', category: 'datetime' },
  { value: 9, label: '日期范围', icon: <CalendarOutlined />, color: '#722ed1', category: 'datetime' },
  { value: 10, label: '日期时间', icon: <CalendarOutlined />, color: '#722ed1', category: 'datetime' },
  { value: 12, label: '时间', icon: <ClockCircleOutlined />, color: '#722ed1', category: 'datetime' },
  { value: 14, label: '滑块', icon: <SlidersOutlined />, color: '#eb2f96', category: 'advanced' },
  { value: 15, label: '评分', icon: <StarOutlined />, color: '#eb2f96', category: 'advanced' },
  { value: 16, label: '开关', icon: <SwitcherOutlined />, color: '#eb2f96', category: 'advanced' },
  { value: 30, label: '评分等级', icon: <StarTwoTone />, color: '#eb2f96', category: 'advanced' },
  { value: 31, label: '签名', icon: <EditOutlined />, color: '#eb2f96', category: 'advanced' },
  { value: 17, label: '文件上传', icon: <UploadOutlined />, color: '#fa8c16', category: 'media' },
  { value: 18, label: '多文件上传', icon: <CloudUploadOutlined />, color: '#fa8c16', category: 'media' },
  { value: 21, label: '图片', icon: <FileTextOutlined />, color: '#fa8c16', category: 'media' },
  { value: 22, label: '视频', icon: <VideoCameraOutlined />, color: '#fa8c16', category: 'media' },
  { value: 23, label: '音频', icon: <AudioOutlined />, color: '#fa8c16', category: 'media' },
  { value: 24, label: '地理位置', icon: <EnvironmentOutlined />, color: '#fa8c16', category: 'media' },
  { value: 29, label: '颜色选择', icon: <BgColorsOutlined />, color: '#13c2c2', category: 'advanced' },
  { value: 33, label: '公告', icon: <QuestionCircleOutlined />, color: '#8c8c8c', category: 'layout' },
  { value: 34, label: '分割线', icon: <MinusOutlined />, color: '#8c8c8c', category: 'layout' },
  { value: 35, label: '分页符', icon: <PaperClipOutlined />, color: '#8c8c8c', category: 'layout' },
  { value: 7, label: '级联选择', icon: <MergeOutlined />, color: '#1890ff', category: 'advanced' },
];

const CATEGORIES = [
  { key: 'choice', label: '选择题', color: '#1890ff' },
  { key: 'input', label: '输入题', color: '#52c41a' },
  { key: 'datetime', label: '日期时间', color: '#722ed1' },
  { key: 'media', label: '媒体上传', color: '#fa8c16' },
  { key: 'advanced', label: '高级组件', color: '#eb2f96' },
  { key: 'layout', label: '布局元素', color: '#8c8c8c' },
];

export const QuestionTypePicker: React.FC<QuestionTypePickerProps> = ({ open, onSelect, onCancel }) => {
  const renderTypeButton = (type: typeof QUESTION_TYPES_CONFIG[0]) => (
    <Card
      hoverable
      size="small"
      style={{
        textAlign: 'center',
        borderColor: '#f0f0f0',
        transition: 'all 0.2s',
      }}
      bodyStyle={{ padding: 12 }}
      onClick={() => onSelect(type.value)}
    >
      <div style={{ fontSize: 24, color: type.color, marginBottom: 4 }}>
        {type.icon}
      </div>
      <Text style={{ fontSize: 12 }}>{type.label}</Text>
    </Card>
  );

  return (
    <Modal
      title="选择题目类型"
      open={open}
      onCancel={onCancel}
      footer={null}
      width={680}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {CATEGORIES.map((cat) => {
        const types = QUESTION_TYPES_CONFIG.filter((t) => t.category === cat.key);
        if (types.length === 0) return null;
        return (
          <div key={cat.key} style={{ marginBottom: 20 }}>
            <div style={{ marginBottom: 8 }}>
              <Tag color={cat.color}>{cat.label}</Tag>
            </div>
            <Row gutter={[8, 8]}>
              {types.map((type) => (
                <Col span={6} key={type.value}>
                  {renderTypeButton(type)}
                </Col>
              ))}
            </Row>
          </div>
        );
      })}
    </Modal>
  );
};

export default QuestionTypePicker;
