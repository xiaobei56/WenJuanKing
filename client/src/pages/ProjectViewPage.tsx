import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Space, Tag, Button, Spin, message } from 'antd';
import { projectAPI, questionAPI } from '../services/api';

const { Title, Text } = Typography;

interface Question {
  id: string;
  title: string;
  type: number;
  required: boolean;
  options: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  type: number;
  status: number;
}

const ProjectViewPage: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (projectId: string) => {
    setLoading(true);
    try {
      const [projectRes, questionsRes] = await Promise.all([
        projectAPI.get(projectId),
        questionAPI.list(projectId),
      ]);
      setProject(projectRes.data);
      setQuestions(questionsRes.data || []);
    } catch (err) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeName = (type: number) => {
    const types: Record<number, string> = {
      1: '单选',
      2: '多选',
      3: '输入框',
      4: '文本域',
      5: '下拉选择',
      8: '日期',
      14: '滑块',
      15: '评分',
      16: '开关',
      26: '数字',
    };
    return types[type] || '未知';
  };

  const renderQuestion = (q: Question, index: number) => {
    let options: any[] = [];
    try {
      options = q.options ? JSON.parse(q.options) : [];
    } catch (e) {}

    return (
      <Card key={q.id} style={{ marginBottom: 16 }} className="survey-question">
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <span style={{ marginRight: 8, fontWeight: 'bold', color: '#666' }}>
            {index + 1}.
          </span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, marginBottom: 8 }}>
              {q.title}
              {q.required && <span style={{ color: 'red' }}> *</span>}
              <span className="question-type-tag">{getQuestionTypeName(q.type)}</span>
            </div>

            {q.type === 1 && ( // 单选
              <div>
                {options.map((opt: any, i: number) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <input type="radio" name={q.id} id={`${q.id}-${i}`} />
                    <label htmlFor={`${q.id}-${i}`} style={{ marginLeft: 8 }}>
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {q.type === 2 && ( // 多选
              <div>
                {options.map((opt: any, i: number) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <input type="checkbox" name={q.id} id={`${q.id}-${i}`} />
                    <label htmlFor={`${q.id}-${i}`} style={{ marginLeft: 8 }}>
                      {opt.label}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {(q.type === 3 || q.type === 26) && ( // 输入框/数字
              <input
                type={q.type === 26 ? 'number' : 'text'}
                style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
                placeholder="请输入答案"
              />
            )}

            {q.type === 4 && ( // 文本域
              <textarea
                style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
                rows={4}
                placeholder="请输入答案"
              />
            )}

            {q.type === 5 && ( // 下拉选择
              <select style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: 4 }}>
                <option value="">请选择</option>
                {options.map((opt: any, i: number) => (
                  <option key={i} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 50 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!project) {
    return <div>项目不存在</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      <Card style={{ marginBottom: 24 }}>
        <Title level={3}>{project.name}</Title>
        <Text type="secondary">{project.description}</Text>
        <div style={{ marginTop: 8 }}>
          <Tag color={project.status === 1 ? 'green' : 'blue'}>
            {project.status === 1 ? '已发布' : '草稿'}
          </Tag>
        </div>
      </Card>

      <div>
        {questions.length === 0 ? (
          <Card>
            <Text type="secondary">暂无题目</Text>
          </Card>
        ) : (
          questions.map((q, i) => renderQuestion(q, i))
        )}
      </div>

      {questions.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 24 }}>
          <Button type="primary" size="large">
            提交答案
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectViewPage;