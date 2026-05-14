import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Spin, message, Button } from 'antd';
import { projectAPI, questionAPI, answerAPI } from '../services/api';

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
  status: number;
}

const SurveyPage: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (projectId: string) => {
    setLoading(true);
    try {
      const projectRes = await projectAPI.get(projectId);
      if (projectRes.data.status !== 1) {
        message.error('该项目未发布');
        return;
      }
      setProject(projectRes.data);

      const questionsRes = await questionAPI.list(projectId);
      setQuestions(questionsRes.data || []);
    } catch (err) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!id) return;

    setSubmitting(true);
    try {
      await answerAPI.submit(id, {
        answers: JSON.stringify(answers),
      });
      message.success('提交成功');
      window.location.href = '/answer/success';
    } catch (err) {
      message.error('提交失败');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const renderQuestion = (q: Question, index: number) => {
    let options: any[] = [];
    try {
      options = q.options ? JSON.parse(q.options) : [];
    } catch (e) {}

    return (
      <Card key={q.id} style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 16, marginBottom: 16 }}>
          <span style={{ fontWeight: 'bold', color: '#666' }}>{index + 1}.</span>
          {' '}
          {q.title}
          {q.required && <span style={{ color: 'red' }}> *</span>}
        </div>

        {q.type === 1 && ( // 单选
          <div>
            {options.map((opt: any, i: number) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === opt.value}
                    onChange={() => handleAnswerChange(q.id, opt.value)}
                  />
                  <span style={{ marginLeft: 8 }}>{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        )}

        {q.type === 2 && ( // 多选
          <div>
            {options.map((opt: any, i: number) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={(answers[q.id] || []).includes(opt.value)}
                    onChange={(e) => {
                      const current = answers[q.id] || [];
                      if (e.target.checked) {
                        handleAnswerChange(q.id, [...current, opt.value]);
                      } else {
                        handleAnswerChange(q.id, current.filter((v: any) => v !== opt.value));
                      }
                    }}
                  />
                  <span style={{ marginLeft: 8 }}>{opt.label}</span>
                </label>
              </div>
            ))}
          </div>
        )}

        {(q.type === 3 || q.type === 26) && (
          <input
            type={q.type === 26 ? 'number' : 'text'}
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
            placeholder="请输入答案"
          />
        )}

        {q.type === 4 && (
          <textarea
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
            rows={4}
            placeholder="请输入答案"
          />
        )}

        {q.type === 5 && (
          <select
            value={answers[q.id] || ''}
            onChange={(e) => handleAnswerChange(q.id, e.target.value)}
            style={{ width: '100%', padding: '8px', border: '1px solid #d9d9d9', borderRadius: 4 }}
          >
            <option value="">请选择</option>
            {options.map((opt: any, i: number) => (
              <option key={i} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        )}
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
    return <div>项目不存在或未发布</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 0' }}>
      <Card style={{ marginBottom: 24, textAlign: 'center' }}>
        <Title level={3}>{project.name}</Title>
        <Text type="secondary">{project.description}</Text>
        <div style={{ marginTop: 8 }}>
          <Text type="secondary">
            {questions.length} 道题 | 第 {currentIndex + 1} / {questions.length}
          </Text>
        </div>
      </Card>

      {questions.length > 0 ? (
        <>
          {questions[currentIndex] && renderQuestion(questions[currentIndex], currentIndex)}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              上一题
            </Button>

            {currentIndex === questions.length - 1 ? (
              <Button
                type="primary"
                onClick={handleSubmit}
                loading={submitting}
              >
                提交
              </Button>
            ) : (
              <Button
                type="primary"
                onClick={() => setCurrentIndex(prev => prev + 1)}
              >
                下一题
              </Button>
            )}
          </div>
        </>
      ) : (
        <Card>
          <Text type="secondary">暂无题目</Text>
        </Card>
      )}
    </div>
  );
};

export default SurveyPage;