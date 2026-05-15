import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Typography, Spin, message, Button, Progress } from 'antd';
import { projectAPI, questionAPI, answerAPI } from '../services/api';
import { getVisibleQuestions, parseLogic, evaluateQuestionLogic, Question as LogicQuestion } from '../utils/logicEngine';

const { Title, Text } = Typography;

interface Question {
  id: string;
  title: string;
  type: number;
  required: boolean;
  options: string;
  logic?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  status: number;
  type?: number;
  settings?: string;
}

const SurveyPage: React.FC = () => {
  const { id } = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [examDuration, setExamDuration] = useState<number>(0);
  const [hiddenQuestionIds, setHiddenQuestionIds] = useState<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (examDuration > 0 && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examDuration]);

  const fetchData = async (projectId: string) => {
    setLoading(true);
    try {
      const projectRes = await projectAPI.get(projectId);
      if (projectRes.data.status !== 1) {
        message.error('该项目未发布');
        return;
      }
      setProject(projectRes.data);

      let duration = 0;
      if (projectRes.data.type === 2 && projectRes.data.settings) {
        try {
          const settings = JSON.parse(projectRes.data.settings);
          duration = settings.examDuration || 0;
        } catch (e) {}
      }

      if (duration > 0) {
        setExamDuration(duration * 60);
        setTimeLeft(duration * 60);
        startTimeRef.current = Date.now();
      }

      const questionsRes = await questionAPI.list(projectId);
      setQuestions(questionsRes.data || []);
    } catch (err) {
      message.error('获取数据失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTimeUp = async () => {
    if (!id) return;
    message.warning('时间到，自动提交');
    try {
      await answerAPI.submit(id, {
        answers: JSON.stringify(answers),
      });
      window.location.href = '/answer/success';
    } catch (err) {
      message.error('提交失败');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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
    const newAnswers = {
      ...answers,
      [questionId]: value,
    };
    setAnswers(newAnswers);

    const newHiddenIds = new Set<string>();
    for (const q of questions) {
      const { hidden } = evaluateQuestionLogic(q, newAnswers);
      if (hidden) {
        newHiddenIds.add(q.id);
      }
    }
    setHiddenQuestionIds(newHiddenIds);
  };

  const visibleQuestions = questions.filter(q => !hiddenQuestionIds.has(q.id));
  const displayQuestions = visibleQuestions; // alias for clarity
  const currentQuestion = displayQuestions[currentIndex];

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
            {displayQuestions.length} 道题 | 第 {currentIndex + 1} / {displayQuestions.length}
          </Text>
        </div>
        {examDuration > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
              <Text type="secondary">剩余时间:</Text>
              <span style={{
                fontSize: 24,
                fontWeight: 'bold',
                color: timeLeft <= 60 ? '#ff4d4f' : '#1890ff',
              }}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <Progress
              percent={Math.round((timeLeft / examDuration) * 100)}
              showInfo={false}
              strokeColor={timeLeft <= 60 ? '#ff4d4f' : '#1890ff'}
              style={{ marginTop: 8 }}
            />
          </div>
        )}
      </Card>

      {displayQuestions.length > 0 ? (
        <>
          {currentQuestion && renderQuestion(currentQuestion, currentIndex)}

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
            <Button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
            >
              上一题
            </Button>

            {currentIndex === displayQuestions.length - 1 ? (
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
                onClick={() => {
                  let nextIdx = currentIndex + 1;
                  while (nextIdx < displayQuestions.length && hiddenQuestionIds.has(displayQuestions[nextIdx].id)) {
                    nextIdx++;
                  }
                  setCurrentIndex(nextIdx);
                }}
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