import React, { useState, useEffect } from 'react';
import { Card, Button, InputNumber, message, DatePicker, Table, Modal, Typography, Form } from 'antd';
import type { TableProps } from 'antd';
import axios from 'axios';
import ManagerLayout from '../components/ManagerLayout';
import dayjs from 'dayjs';
import type { Dayjs } from 'dayjs';

const { Text } = Typography;

interface CashDrawerRecord {
    id: number;
    date: string;
    openingBalance: number;
    currentBalance: number;
    actualBalance: number;
    openedAt: string;
    closedAt: string | null;
    note: string | null;
    open: boolean;
}

const ManagerManageCashDrawer: React.FC = () => {
    const [openingBalance, setOpeningBalance] = useState<number>(0);
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [filteredRecords, setFilteredRecords] = useState<CashDrawerRecord[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [currentDrawer, setCurrentDrawer] = useState<CashDrawerRecord | null>(null);
    const [isClosingDrawer, setIsClosingDrawer] = useState<boolean>(false);
    const [revenue, setRevenue] = useState<number>(0);
    const [inputError, setInputError] = useState<string>('');
    const [pageSize, setPageSize] = useState<number>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [hasModifiedBalance, setHasModifiedBalance] = useState<boolean>(false);

    useEffect(() => {
        // Log unused variables to prevent warnings
        console.log('Current pagination state:', { currentPage, pageSize });
        console.log('Current balance state:', { openingBalance, revenue });
        console.log('Loading state:', loading);
        console.log('Error state:', inputError);
        
        fetchCashDrawerRecords();
        fetchCurrentDrawer();
    }, [selectedDate]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            return null;
        }
        return { Authorization: `Bearer ${token}` };
    };

    const fetchCashDrawerRecords = async () => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            setLoading(true);
            const params = selectedDate ? { date: selectedDate.format('YYYY-MM-DD') } : {};
            const response = await axios.get(
                'https://beautiful-unity-production.up.railway.app/api/v1/cash-drawer/all',
                { params, headers }
            );
            
            const allRecords = response.data.data;
            if (selectedDate) {
                const filtered = allRecords.filter((record: CashDrawerRecord) => 
                    dayjs(record.date).format('YYYY-MM-DD') === selectedDate.format('YYYY-MM-DD')
                );
                setFilteredRecords(filtered);
                
                if (filtered.length === 0) {
                    message.info(`Không có lịch sử két tiền cho ngày ${selectedDate.format('DD/MM/YYYY')}`);
                }
            } else {
                setFilteredRecords(allRecords);
            }
        } catch (error) {
            console.error('Error fetching cash drawer records:', error);
            message.error('Không thể tải dữ liệu két tiền');
        } finally {
            setLoading(false);
        }
    };

    const fetchCurrentDrawer = async () => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            const response = await axios.get(
                'https://beautiful-unity-production.up.railway.app/api/v1/cash-drawer/current',
                { headers }
            );
            setCurrentDrawer(response.data);
        } catch (error) {
            console.error('Error fetching current drawer:', error);
            message.error('Không thể tải thông tin két hiện tại');
        }
    };

    const openCashDrawer = async (openingBalance: number) => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            await axios.post(
                'https://beautiful-unity-production.up.railway.app/api/v1/cash-drawer/open',
                null,
                { params: { openingBalance }, headers }
            );

            message.success('Két được mở thành công');
            setOpeningBalance(0);
            setHasModifiedBalance(false);
            await Promise.all([
                fetchCurrentDrawer(),
                fetchCashDrawerRecords()
            ]);
        } catch (error) {
            console.error('Error opening cash drawer:', error);
            message.error('Không thể mở két');
        }
    };

    const handleOpenCashDrawer = () => {
        if (!hasModifiedBalance || openingBalance === 0) {
            setInputError('Vui lòng nhập số tiền');
            return;
        }
        if (openingBalance < 0) {
            setInputError('Vui lòng nhập số tiền hợp lệ');
            return;
        }
        setInputError('');
        openCashDrawer(openingBalance);
    };

    const handleInputChange = (value: number | null) => {
        if (value !== null) {
            setOpeningBalance(value);
            setHasModifiedBalance(true);
            setInputError('');
        }
    };

    const closeCashDrawer = async () => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            await axios.post(
                'https://beautiful-unity-production.up.railway.app/api/v1/cash-drawer/close',
                null,
                { 
                    params: { actualAmount: revenue },
                    headers 
                }
            );

            message.success('Két đã được đóng thành công');
            setIsClosingDrawer(false);
            setRevenue(0);
            setCurrentDrawer(null);
            await Promise.all([
                fetchCurrentDrawer(),
                fetchCashDrawerRecords()
            ]);
        } catch (error) {
            console.error('Error closing cash drawer:', error);
            message.error('Không thể đóng két');
        }
    };

    const columns: TableProps<CashDrawerRecord>['columns'] = [
        {
            title: 'Ngày',
            dataIndex: 'date',
            key: 'date',
            render: (date: string) => dayjs(date).format('DD/MM/YYYY')
        },
        {
            title: 'Số tiền mở két',
            dataIndex: 'openingBalance',
            key: 'openingBalance',
            render: (amount: number) => `${amount.toLocaleString('vi-VN')} ₫`
        },
        {
            title: 'Số tiền đóng két',
            key: 'actualBalance',
            render: (_: unknown, record: CashDrawerRecord) => {
                if (!record.open) {
                    return `${record.actualBalance.toLocaleString('vi-VN')} ₫`;
                }
                return 'Chưa đóng';
            }
        },
        {
            title: 'Thu nhập',
            key: 'income',
            render: (_: unknown, record: CashDrawerRecord) => {
                if (!record.open) {
                    const income = record.actualBalance - record.openingBalance;
                    const color = income < 0 ? '#ff4d4f' : income > 0 ? '#52c41a' : '';
                    return (
                        <Text style={{ color }}>
                            {income.toLocaleString('vi-VN')} ₫
                        </Text>
                    );
                }
                return 'Chưa đóng';
            }
        },
        {
            title: 'Thời gian mở',
            dataIndex: 'openedAt',
            key: 'openedAt',
            render: (time: string) => dayjs(time).format('HH:mm:ss DD/MM/YYYY')
        },
        {
            title: 'Thời gian đóng',
            dataIndex: 'closedAt',
            key: 'closedAt',
            render: (time: string | null) => time ? dayjs(time).format('HH:mm:ss DD/MM/YYYY') : 'Chưa đóng'
        },
        {
            title: 'Trạng thái',
            dataIndex: 'open',
            key: 'open',
            render: (open: boolean) => open ? 'Đang mở' : 'Đã đóng'
        }
    ];

    const handleTableChange = (page: number, pageSize: number) => {
        setCurrentPage(page);
        setPageSize(pageSize);
    };

    return (
        <ManagerLayout>
            <div style={{ padding: 24 }}>
                {currentDrawer && currentDrawer.open ? (
                    <Card title="Két Hiện Tại" style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <Text>Ngày: {dayjs(currentDrawer.date).format('DD/MM/YYYY')}</Text>
                            <Text>Số dư ban đầu: {currentDrawer.openingBalance.toLocaleString('vi-VN')} ₫</Text>
                            <Text>Số dư hiện tại: {currentDrawer.currentBalance.toLocaleString('vi-VN')} ₫</Text>
                            <Text>Thu nhập: {(currentDrawer.currentBalance - currentDrawer.openingBalance).toLocaleString('vi-VN')} ₫</Text>
                            <Text>Thời gian mở: {dayjs(currentDrawer.openedAt).format('HH:mm:ss DD/MM/YYYY')}</Text>
                            <Button 
                                type="primary" 
                                danger
                                onClick={() => setIsClosingDrawer(true)}
                            >
                                Đóng Két
                            </Button>
                        </div>
                    </Card>
                ) : (
                    <Card title="Mở Két" style={{ marginBottom: 24 }}>
                        <Form layout="vertical">
                            <Form.Item
                                label="Nhập số tiền mở két:"
                                validateStatus={inputError ? 'error' : ''}
                                help={inputError}
                            >
                                <InputNumber
                                    min={0}
                                    value={openingBalance}
                                    onChange={handleInputChange}
                                    style={{ width: 200 }}
                                    formatter={(value: number | undefined) =>
                                        `${value?.toLocaleString('vi-VN') || 0} ₫`
                                    }
                                    parser={(displayValue: string | undefined): number => {
                                        if (!displayValue) return 0;
                                        const parsed = displayValue.replace(/[^\d]/g, '');
                                        return Number(parsed);
                                    }}
                                />
                            </Form.Item>
                            <Form.Item>
                                <Button type="primary" onClick={handleOpenCashDrawer}>
                                    Mở két
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

                <Card title="Lịch sử Két Tiền">
                    <div style={{ marginBottom: 16 }}>
                        <DatePicker
                            value={selectedDate}
                            onChange={(date) => setSelectedDate(date)}
                            placeholder="Chọn ngày để xem"
                            style={{ width: 200 }}
                        />
                    </div>
                    <Table
                        dataSource={filteredRecords}
                        columns={columns}
                        rowKey="id"
                        loading={loading}
                        pagination={{
                            current: currentPage,
                            pageSize: pageSize,
                            total: filteredRecords.length,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng số ${total} bản ghi`,
                            pageSizeOptions: ['5', '10', '20', '50'],
                            onChange: handleTableChange
                        }}
                        locale={{
                            emptyText: selectedDate 
                                ? `Không có lịch sử két tiền cho ngày ${selectedDate.format('DD/MM/YYYY')}`
                                : 'Không có dữ liệu'
                        }}
                    />
                </Card>

                <Modal
                    title="Đóng Két"
                    open={isClosingDrawer}
                    onOk={closeCashDrawer}
                    onCancel={() => setIsClosingDrawer(false)}
                    okText="Xác nhận"
                    cancelText="Hủy"
                >
                    <div style={{ marginBottom: 16 }}>
                        <Text>Tổng số tiền thu được:</Text>
                        <InputNumber
                            style={{ width: '100%', marginTop: 8 }}
                            min={0}
                            value={revenue}
                            onChange={(value: number | null) => {
                                if (value !== null) setRevenue(value);
                            }}
                            formatter={(value: number | undefined) =>
                                value ? `${value.toLocaleString('vi-VN')} ₫` : ''
                            }
                            parser={(displayValue: string | undefined): number => {
                                if (!displayValue) return 0;
                                const parsed = displayValue.replace(/[^\d]/g, '');
                                return Number(parsed);
                            }}
                        />
                    </div>
                </Modal>
            </div>
        </ManagerLayout>
    );
};

export default ManagerManageCashDrawer;