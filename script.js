import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const ProgressiveQuizComponent = () => {
  const [quizData, setQuizData] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        // Giả lập API call
        const data = [
          {
            id: 1,
            question: "Thủ đô của Việt Nam là gì?",
            options: ["Hà Nội", "Hồ Chí Minh", "Đà Nẵng", "Hải Phòng"],
            correctAnswer: "Hà Nội"
          },
          {
            id: 2,
            question: "Sông nào dài nhất Việt Nam?",
            options: ["Sông Hồng", "Sông Mekong", "Sông Đà", "Sông Đồng Nai"],
            correctAnswer: "Sông Mekong"
          },
          {
            id: 3,
            question: "Việt Nam có bao nhiêu tỉnh thành?",
            options: ["58", "60", "63", "65"],
            correctAnswer: "63"
          },
        ];
        setQuizData(data);
        setLoading(false);
      } catch (error) {
        console.error('Lỗi khi tải câu hỏi:', error);
        setLoading(false);
      }
    };

    fetchQuestions();
  }, []);

  const handleAnswerSelect = (questionId, answer) => {
    setUserAnswers(prev => ({...prev, [questionId]: answer}));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    return quizData.reduce((score, question) => {
      return score + (userAnswers[question.id] === question.correctAnswer ? 1 : 0);
    }, 0);
  };

  if (loading) {
    return <div className="text-center p-4">Đang tải câu hỏi...</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold text-center mb-6">Bài kiểm tra</h1>
      {quizData.map((question, index) => (
        <Card key={question.id} className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold p-4 bg-gray-200 rounded-lg">
              Câu {index + 1}: {question.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              {question.options.map((option, optionIndex) => (
                <div
                  key={optionIndex}
                  className={`p-4 rounded-lg cursor-pointer transition-all text-center ${
                    userAnswers[question.id] === option
                      ? 'border-2 border-blue-500'
                      : 'border border-gray-300'
                  } ${
                    showResults && option === question.correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : showResults && userAnswers[question.id] === option && option !== question.correctAnswer
                      ? 'bg-red-100 border-red-500'
                      : ''
                  }`}
                  onClick={() => !showResults && handleAnswerSelect(question.id, option)}
                >
                  {option}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      {!showResults ? (
        <Button 
          onClick={handleSubmit} 
          disabled={Object.keys(userAnswers).length !== quizData.length}
          className="w-full mt-6"
        >
          Nộp bài
        </Button>
      ) : (
        <div className="mt-6 p-4 bg-blue-100 rounded-lg text-center">
          <h2 className="text-xl font-bold">Kết quả</h2>
          <p className="text-lg mt-2">
            Điểm của bạn: {calculateScore()} / {quizData.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProgressiveQuizComponent;