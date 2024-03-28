import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/reducers';
import LayoutComponent from '../components/LayoutComponent';
import { Navigate } from 'react-router-dom';
import { loginRequest } from '../store/actions';
import { selectUsername, selectToken } from '../store/authSlice';
import { Row, Col, Typography, Spin, Alert, Card, Button } from 'antd';
import { Chart, registerables } from 'chart.js';
import { subDays, format } from 'date-fns';
import '../index.css';
import { HeartOutlined } from '@ant-design/icons';
interface AnalyticsDataItem {
    date: string;
    noteCount: number;
    todoCount: number;
}

Chart.register(...registerables);

const { Title: AntdTitle } = Typography;

const MainPage: React.FC = () => {
    const isLoggedIn = useSelector((state: RootState) => state.auth.isLoggedIn);
    const dispatch = useDispatch();
    const username = useSelector(selectUsername);
    const token = useSelector(selectToken);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [analyticsData, setAnalyticsData] = useState<AnalyticsDataItem[]>([]);
    const [reviewedNotesCount, setReviewedNotesCount] = useState(0);
    const [completedTodosCount, setCompletedTodosCount] = useState(0);
    const [weekDates, setWeekDates] = useState<string[]>([]);
    const [isWeeklyView, setIsWeeklyView] = useState(true); // Track whether to show weekly view or daily view
    const [todaysNotesCount, setTodaysNotesCount] = useState(0);
    const [todaysTodosCount, setTodaysTodosCount] = useState(0);
    const weeklyChartRef = useRef<HTMLCanvasElement | null>(null);
    const dailyChartRef = useRef<HTMLCanvasElement | null>(null);
    const weeklyChartInstanceRef = useRef<Chart | null>(null);
    const dailyChartInstanceRef = useRef<Chart | null>(null);

    useEffect(() => {
        dispatch(loginRequest());
    }, [dispatch]);

    useEffect(() => {
        const fetchWeeklyAnalyticsData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/weekly-analytics`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                const result = await response.json();
                setAnalyticsData(result);
                setError('');
            } catch (error) {
                console.error('Error fetching weekly analytics data:', error);
                setError('Error fetching weekly analytics data. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchWeeklyAnalyticsData();
    }, [token]);

    useEffect(() => {
        const fetchDailyAnalysisData = async () => {
            setLoading(true);
            try {
                const response = await fetch(`http://localhost:3001/api/daily-analysis`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const result = await response.json();
                setReviewedNotesCount(result.reviewedNotesCount);
                setCompletedTodosCount(result.completedTodosCount);
                setError('');
            } catch (error) {
                console.error('Error fetching daily analysis data:', error);
                setError('Error fetching daily analysis data. Please try again later.');
            }
        };

        fetchDailyAnalysisData();
    }, [token]);

    useEffect(() => {
        const today = new Date();
        const dates = [];
        for (let i = 0; i < 7; i++) {
            const date = subDays(today, i);
            dates.push(format(date, 'yyyy-MM-dd'));
        }
        setWeekDates(dates.reverse());
    }, []);

    useEffect(() => {
        if (weeklyChartRef.current && isWeeklyView) {
            const weeklyChartCtx = weeklyChartRef.current.getContext('2d');
            if (weeklyChartCtx) {
                // Destroy existing chart instance if it exists
                Chart.getChart(weeklyChartRef.current)?.destroy();
                // Create new chart instance
                weeklyChartInstanceRef.current = new Chart(weeklyChartCtx, {
                    type: 'bar',
                    data: {
                        labels: weekDates,
                        datasets: [
                            {
                                label: 'Notes',
                                data: weekDates.map(date => {
                                    const dataItem = Array.isArray(analyticsData) ? analyticsData.find(item => item.date === date) : null;
                                    return dataItem ? dataItem.noteCount : 0;
                                }),
                                backgroundColor: 'rgba(54, 162, 235, 0.5)'
                            },
                            {
                                label: 'Todos',
                                data: weekDates.map(date => {
                                    const dataItem = Array.isArray(analyticsData) ? analyticsData.find(item => item.date === date) : null;
                                    return dataItem ? dataItem.todoCount : 0;
                                }),
                                backgroundColor: 'rgba(255, 99, 132, 0.5)'
                            }
                        ]

                    },
                    options: {
                        scales: {
                            x: {
                                type: 'category',
                                labels: weekDates,
                                min: 0
                            },
                            y: {
                                min: 0,
                                suggestedMin: 0,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        },
                        layout: {
                            padding: {
                                left: 50,
                                right: 50,
                                top: 50,
                                bottom: 50
                            }
                        }
                    }
                });
            }
        }
    }, [analyticsData, weekDates, isWeeklyView]);

    useEffect(() => {
        if (dailyChartRef.current && !isWeeklyView) {
            const dailyChartCtx = dailyChartRef.current.getContext('2d');
            if (dailyChartCtx) {
                // Destroy existing chart instance if it exists
                Chart.getChart(dailyChartRef.current)?.destroy();
                // Create new chart instance
                dailyChartInstanceRef.current = new Chart(dailyChartCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Reviewed Notes', 'Completed Todos'],
                        datasets: [
                            {
                                label: 'Count',
                                data: [reviewedNotesCount, completedTodosCount],
                                backgroundColor: [
                                    'rgba(54, 162, 235, 0.5)',
                                    'rgba(255, 99, 132, 0.5)'
                                ]
                            }
                        ]
                    },
                    options: {
                        scales: {
                            y: {
                                min: 0,
                                suggestedMin: 0,
                                ticks: {
                                    stepSize: 1
                                }
                            }
                        },
                        layout: {
                            padding: {
                                left: 50,
                                right: 50,
                                top: 50,
                                bottom: 50
                            }
                        }
                    }
                });
            }
        }
    }, [reviewedNotesCount, completedTodosCount, isWeeklyView]);

    useEffect(() => {
        const fetchTodaysCounts = async () => {
            setLoading(true);
            try {

                const response = await fetch(`http://localhost:3001/api/todays-counts`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                const result = await response.json();
                setTodaysNotesCount(result.notesCount);
                setTodaysTodosCount(result.todosCount);
                setError('');
            } catch (error) {
                console.error('Error fetching today\'s counts:', error);
                setError('Error fetching today\'s counts. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchTodaysCounts();
    }, [token]);
    const handleViewChange = (view: string) => {
        if (view === 'weekly') {
            setIsWeeklyView(true);
        } else if (view === 'daily') {
            setIsWeeklyView(false);
        }
    };

    if (!isLoggedIn) {
        return <Navigate to="/login" />;
    }

    return (
        <LayoutComponent username={username}>
            <div style={{ padding: '20px' }}>
                <Row gutter={[16, 16]} justify="center">
                    <Col span={24}>
                        <div className="main-page">
                            <Typography.Text className="greeting-text">
                                <HeartOutlined className="icon-heart" />
                                <Typography.Text style={{ fontSize: '16px', fontWeight: 'normal' }}>
                                    Hi, {username}, today you have created {todaysNotesCount} notes and {todaysTodosCount} todos! Good job!
                                </Typography.Text>
                            </Typography.Text>
                        </div>

                    </Col>
                </Row>
                <Row justify="center">
                    <Col xs={24} sm={12} md={12} lg={12} xl={12}>
                        <Card title="Analytics" style={{ width: '100%' }}>
                            <Button.Group>
                                <Button onClick={() => handleViewChange('weekly')} type={isWeeklyView ? 'primary' : 'default'}>Weekly</Button>
                                <Button onClick={() => handleViewChange('daily')} type={!isWeeklyView ? 'primary' : 'default'}>Daily</Button>
                            </Button.Group>
                            {loading ? (
                                <Spin />
                            ) : error ? (
                                <Alert message={error} type="error" />
                            ) : isWeeklyView ? (
                                <canvas ref={weeklyChartRef} width="400" height="200"></canvas>
                            ) : (
                                <canvas ref={dailyChartRef} width="400" height="200"></canvas>
                            )}
                        </Card>
                    </Col>
                </Row>
            </div>
        </LayoutComponent>
    );
};

export default MainPage;
