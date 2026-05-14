import React, { useState } from 'react';
import { Radio, Checkbox, Input, Select, DatePicker, TimePicker, Slider, Rate, Switch, InputNumber, Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

const { TextArea } = Input;

interface QuestionOption {
  label: string;
  value: string;
  score?: number;
}

interface QuestionComponentProps {
  type: number;
  options: QuestionOption[];
  value: any;
  onChange: (value: any) => void;
  settings?: any;
}

export const RadioQuestion: React.FC<QuestionComponentProps> = ({ options, value, onChange }) => (
  <Radio.Group value={value} onChange={(e) => onChange(e.target.value)}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {options.map((opt, i) => (
        <Radio key={i} value={opt.value}>
          {opt.label}
          {opt.score !== undefined && <span style={{ color: '#999', marginLeft: 8 }}>({opt.score}分)</span>}
        </Radio>
      ))}
    </div>
  </Radio.Group>
);

export const CheckboxQuestion: React.FC<QuestionComponentProps> = ({ options, value, onChange }) => (
  <Checkbox.Group value={value || []} onChange={(vals) => onChange(vals)}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {options.map((opt, i) => (
        <Checkbox key={i} value={opt.value}>
          {opt.label}
          {opt.score !== undefined && <span style={{ color: '#999', marginLeft: 8 }}>({opt.score}分)</span>}
        </Checkbox>
      ))}
    </div>
  </Checkbox.Group>
);

export const InputQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="请输入内容"
    maxLength={500}
  />
);

export const TextareaQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <TextArea
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="请输入内容"
    rows={4}
    maxLength={2000}
  />
);

export const SelectQuestion: React.FC<QuestionComponentProps> = ({ options, value, onChange }) => (
  <Select
    value={value}
    onChange={onChange}
    placeholder="请选择"
    style={{ width: '100%' }}
    options={options.map(opt => ({ label: opt.label, value: opt.value }))}
  />
);

export const MultiSelectQuestion: React.FC<QuestionComponentProps> = ({ options, value, onChange }) => (
  <Select
    mode="multiple"
    value={value || []}
    onChange={onChange}
    placeholder="请选择"
    style={{ width: '100%' }}
    options={options.map(opt => ({ label: opt.label, value: opt.value }))}
  />
);

export const CascaderQuestion: React.FC<QuestionComponentProps> = ({ options, value, onChange }) => {
  const cascaderOptions = options.map(opt => ({
    label: opt.label,
    value: opt.value,
    children: opt.children?.map((child: any) => ({
      label: child.label,
      value: child.value,
    })),
  }));
  return (
    <Select
      value={value}
      onChange={onChange}
      placeholder="请选择"
      style={{ width: '100%' }}
      options={cascaderOptions}
    />
  );
};

export const DateQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <DatePicker
    value={value ? dayjs(value) : null}
    onChange={(date) => onChange(date?.toISOString() || null)}
    style={{ width: '100%' }}
  />
);

export const DateRangeQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <DatePicker.RangePicker
    value={value}
    onChange={(dates) => onChange(dates)}
    style={{ width: '100%' }}
  />
);

export const DateTimeQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <DatePicker
    showTime
    value={value ? dayjs(value) : null}
    onChange={(date) => onChange(date?.toISOString() || null)}
    style={{ width: '100%' }}
  />
);

export const DateTimeRangeQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <DatePicker.RangePicker
    showTime
    value={value}
    onChange={(dates) => onChange(dates)}
    style={{ width: '100%' }}
  />
);

export const TimeQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <TimePicker
    value={value ? dayjs(value, 'HH:mm:ss') : null}
    onChange={(time) => onChange(time?.format('HH:mm:ss') || null)}
    style={{ width: '100%' }}
  />
);

export const TimeRangeQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <TimePicker.RangePicker
    value={value}
    onChange={(times) => onChange(times)}
    style={{ width: '100%' }}
  />
);

export const SliderQuestion: React.FC<QuestionComponentProps> = ({ value, onChange, settings }) => (
  <Slider
    min={settings?.min || 0}
    max={settings?.max || 100}
    step={settings?.step || 1}
    marks={settings?.marks || undefined}
    value={value || settings?.defaultValue || 50}
    onChange={onChange}
  />
);

export const RateQuestion: React.FC<QuestionComponentProps> = ({ value, onChange, settings }) => (
  <Rate
    count={settings?.count || 5}
    value={value || 0}
    onChange={onChange}
  />
);

export const SwitchQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Switch
    checked={value}
    onChange={onChange}
    checkedChildren="是"
    unCheckedChildren="否"
  />
);

export const UploadQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Upload
    fileList={value ? [{ uid: '-1', name: value, status: 'done', url: value }] : []}
    beforeUpload={() => false}
    onChange={(info) => {
      if (info.fileList.length > 0) {
        onChange(info.fileList[0].response?.url || info.fileList[0].name);
      } else {
        onChange(null);
      }
    }}
  >
    <Button icon={<UploadOutlined />}>上传文件</Button>
  </Upload>
);

export const UploaderQuestion: React.FC<QuestionComponentProps> = ({ value, onChange, settings }) => {
  const maxCount = settings?.maxCount || 3;
  return (
    <Upload
      multiple
      maxCount={maxCount}
      fileList={value || []}
      beforeUpload={() => false}
      onChange={(info) => onChange(info.fileList)}
    >
      <Button icon={<UploadOutlined />}>上传文件（最多{maxCount}个）</Button>
    </Upload>
  );
};

export const NumberQuestion: React.FC<QuestionComponentProps> = ({ value, onChange, settings }) => (
  <InputNumber
    min={settings?.min || 0}
    max={settings?.max || 999999999}
    step={settings?.step || 1}
    value={value}
    onChange={onChange}
    style={{ width: '100%' }}
  />
);

export const CurrencyQuestion: React.FC<QuestionComponentProps> = ({ value, onChange, settings }) => {
  const prefix = settings?.prefix || '¥';
  return (
    <InputNumber
      min={0}
      max={999999999}
      precision={2}
      prefix={prefix}
      value={value}
      onChange={onChange}
      style={{ width: '100%' }}
    />
  );
};

export const PhoneQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="请输入手机号"
    maxLength={11}
  />
);

export const EmailQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Input
    type="email"
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="请输入邮箱"
  />
);

export const URLQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder="请输入网址"
    addonBefore="http://"
  />
);

export const ColorQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Input
    type="color"
    value={value || '#000000'}
    onChange={(e) => onChange(e.target.value)}
    style={{ width: 100, height: 40 }}
  />
);

export const GradeQuestion: React.FC<QuestionComponentProps> = ({ value, onChange, settings }) => {
  const count = settings?.count || 5;
  return <Rate count={count} value={value || 0} onChange={onChange} />;
};

export const LocationQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <Input placeholder="请输入位置" value={value} onChange={(e) => onChange(e.target.value)} />
);

export const ButtonQuestion: React.FC<QuestionComponentProps> = ({ settings }) => (
  <Button type={settings?.type || 'primary'}>{settings?.text || '按钮'}</Button>
);

export const ImageQuestion: React.FC<QuestionComponentProps> = ({ settings }) => (
  settings?.url ? <img src={settings.url} alt="" style={{ maxWidth: '100%', maxHeight: 300 }} /> : null
);

export const VideoQuestion: React.FC<QuestionComponentProps> = ({ settings }) => (
  settings?.url ? <video src={settings.url} controls style={{ maxWidth: '100%' }} /> : null
);

export const AudioQuestion: React.FC<QuestionComponentProps> = ({ settings }) => (
  settings?.url ? <audio src={settings.url} controls /> : null
);

export const AnnouncementQuestion: React.FC<QuestionComponentProps> = ({ settings }) => (
  <div style={{ padding: 16, background: '#f5f5f5', borderRadius: 8 }}>
    {settings?.content || '公告内容'}
  </div>
);

export const DividerQuestion: React.FC<QuestionComponentProps> = ({ settings }) => (
  <hr style={{ border: 'none', borderTop: settings?.style || '1px solid #e8e8e8', margin: '16px 0' }} />
);

export const SignatureQuestion: React.FC<QuestionComponentProps> = ({ value, onChange }) => (
  <div>
    <Button onClick={() => onChange('signature_' + Date.now())}>点击签名</Button>
    {value && <div style={{ marginTop: 8, color: '#52c41a' }}>已签名</div>}
  </div>
);

export const PageBreakQuestion: React.FC<QuestionComponentProps> = () => (
  <div style={{ textAlign: 'center', color: '#999', padding: 20, border: '1px dashed #d9d9d9' }}>
    --- 分页符 ---
  </div>
);

export const getQuestionComponent = (type: number) => {
  const components: Record<number, React.FC<QuestionComponentProps>> = {
    1: RadioQuestion,
    2: CheckboxQuestion,
    3: InputQuestion,
    4: TextareaQuestion,
    5: SelectQuestion,
    6: MultiSelectQuestion,
    7: CascaderQuestion,
    8: DateQuestion,
    9: DateRangeQuestion,
    10: DateTimeQuestion,
    11: DateTimeRangeQuestion,
    12: TimeQuestion,
    13: TimeRangeQuestion,
    14: SliderQuestion,
    15: RateQuestion,
    16: SwitchQuestion,
    17: UploadQuestion,
    18: UploaderQuestion,
    20: ButtonQuestion,
    21: ImageQuestion,
    22: VideoQuestion,
    23: AudioQuestion,
    24: LocationQuestion,
    25: PhoneQuestion,
    26: NumberQuestion,
    27: CurrencyQuestion,
    29: URLQuestion,
    30: ColorQuestion,
    31: GradeQuestion,
    33: SignatureQuestion,
    34: AnnouncementQuestion,
    35: DividerQuestion,
    36: PageBreakQuestion,
  };
  return components[type] || InputQuestion;
};