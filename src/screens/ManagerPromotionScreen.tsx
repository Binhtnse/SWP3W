import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Form, Input, InputNumber, DatePicker, message, Modal, Spin, Switch, Select, Space } from 'antd';
import { Typography } from 'antd';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';
import type { TablePaginationConfig } from 'antd/es/table';
import type { TableProps } from 'antd/es/table';
import ManagerLayout from '../components/ManagerLayout';
import ErrorBoundary from '../components/ErrorBoundary';
import { ReloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface PromotionRequest {
    name: string;
    code: string;
    description: string;
    minTotal: number;
    discountPercent: number;
    dateOpen: string;
    dateEnd: string;
}

interface Promotion extends PromotionRequest {
    id: string;
    status: 'ACTIVE' | 'DELETED';
    createdAt: string;
    updatedAt: string;
}

interface ApiResponse {
    data: Promotion[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

interface PaginationType {
    current: number;
    pageSize: number;
    total: number;
    pageSizeOptions: string[];
    showSizeChanger: boolean;
}

interface FormValues {
    name: string;
    code: string;
    description: string;
    minTotal: number;
    discountPercent: number;
    dateOpen: Dayjs;
    dateEnd: Dayjs;
}

interface FilterType {
    name: string;
    status: 'ALL' | 'ACTIVE' | 'DELETED';
}

const DATE_FORMAT = 'DD/MM/YYYY HH:mm:ss';

const API_DATE_FORMAT = 'YYYY/MM/DD HH:mm:ss';

const ManagerPromotionContent: React.FC = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [promotions, setPromotions] = useState<Promotion[]>([]);
    const [pagination, setPagination] = useState<PaginationType>({
        current: 1,
        pageSize: 10,
        total: 0,
        pageSizeOptions: ['10', '20', '50', '100'],
        showSizeChanger: true
    });
    const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
    const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null);
    const [existingCodes, setExistingCodes] = useState<string[]>([]);
    const [form] = Form.useForm<FormValues>();
    const [filters, setFilters] = useState<FilterType>({
        name: '',
        status: 'ALL'
    });
    const [allPromotions, setAllPromotions] = useState<Promotion[]>([]);

    const getAuthHeader = (): { Authorization: string } | null => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            message.error('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại');
            return null;
        }
        return { Authorization: `Bearer ${token}` };
    };

    const fetchPromotions = async (page: number = 0, pageSize: number = pagination.pageSize) => {
        setLoading(true);
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            const response = await axios.get<ApiResponse>(
                'https://beautiful-unity-production.up.railway.app/api/v1/promotions/all',
                {
                    headers,
                    params: {
                        page: 0,
                        size: 1000
                    }
                }
            );

            const { data } = response.data;
            setAllPromotions(data);

            let filteredData = [...data];
            
            if (filters.name) {
                filteredData = filteredData.filter(promo => 
                    promo.name.toLowerCase().includes(filters.name.toLowerCase())
                );
            }

            if (filters.status !== 'ALL') {
                filteredData = filteredData.filter(promo => 
                    promo.status === filters.status
                );
            }

            const startIndex = page * pageSize;
            const endIndex = startIndex + pageSize;
            const paginatedData = filteredData.slice(startIndex, endIndex);

            setPromotions(paginatedData);
            setExistingCodes(data.map(promo => promo.code));
            setPagination(prev => ({
                ...prev,
                current: page + 1,
                total: filteredData.length,
                pageSize: pageSize
            }));
        } catch (error) {
            console.error("Error fetching promotions:", error);
            message.error('Không thể tải danh sách khuyến mãi');
        } finally {
            setLoading(false);
        }
    };

    const handleTableChange = (newPagination: TablePaginationConfig) => {
        const page = (newPagination.current || 1) - 1;
        const pageSize = newPagination.pageSize || 10;

        let filteredData = [...allPromotions];
        
        if (filters.name) {
            filteredData = filteredData.filter(promo => 
                promo.name.toLowerCase().includes(filters.name.toLowerCase())
            );
        }

        if (filters.status !== 'ALL') {
            filteredData = filteredData.filter(promo => 
                promo.status === filters.status
            );
        }

        const startIndex = page * pageSize;
        const endIndex = startIndex + pageSize;
        const paginatedData = filteredData.slice(startIndex, endIndex);

        setPromotions(paginatedData);
        setPagination(prev => ({
            ...prev,
            current: page + 1,
            pageSize: pageSize,
            total: filteredData.length
        }));
    };

    const handleEdit = (promotion: Promotion) => {
        setEditingPromotion(promotion);
        form.setFieldsValue({
            ...promotion,
            dateOpen: dayjs(promotion.dateOpen, DATE_FORMAT),
            dateEnd: dayjs(promotion.dateEnd, DATE_FORMAT)
        });
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingPromotion(null);
        form.resetFields();
    };

    const handleSubmit = async (values: any) => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            const code = String(values.code).trim().toUpperCase();
            
            const dateOpen = dayjs(values.dateOpen).format(API_DATE_FORMAT);
            const dateEnd = dayjs(values.dateEnd).format(API_DATE_FORMAT);

            if (!dayjs(dateOpen, API_DATE_FORMAT).isValid() || !dayjs(dateEnd, API_DATE_FORMAT).isValid()) {
                message.error('Ngày không hợp lệ');
                return;
            }

            if (editingPromotion) {
                if (code !== editingPromotion.code) {
                    const otherCodes = existingCodes.filter(existingCode => existingCode !== editingPromotion.code);
                    if (otherCodes.includes(code)) {
                        message.error('Mã khuyến mãi này đã tồn tại, vui lòng chọn mã khác');
                        return;
                    }
                }
            } else {
                if (existingCodes.includes(code)) {
                    message.error('Mã khuyến mãi này đã tồn tại, vui lòng chọn mã khác');
                    return;
                }
            }

            const promotionData: PromotionRequest = {
                name: String(values.name).trim(),
                code: code,
                description: values.description ? String(values.description).trim() : '',
                minTotal: Number(values.minTotal),
                discountPercent: Number(values.discountPercent),
                dateOpen: dateOpen,
                dateEnd: dateEnd
            };

            let response;
            if (editingPromotion) {
                response = await axios.put(
                    `https://beautiful-unity-production.up.railway.app/api/v1/promotions/${editingPromotion.id}`,
                    promotionData,
                    { 
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                message.success('Cập nhật khuyến mãi thành công');
            } else {
                response = await axios.post(
                    'https://beautiful-unity-production.up.railway.app/api/v1/promotions',
                    promotionData,
                    { 
                        headers: {
                            ...headers,
                            'Content-Type': 'application/json'
                        }
                    }
                );
                message.success('Tạo khuyến mãi thành công');
            }

            if (response.status === 201 || response.status === 200) {
                setIsModalVisible(false);
                setEditingPromotion(null);
                form.resetFields();
                fetchPromotions();
            }
        } catch (error) {
            console.error("Error submitting promotion:", error);
            if (axios.isAxiosError(error)) {
                console.error("Error response data:", error.response?.data);
                const errorMessage = error.response?.data?.message || 'Không thể lưu khuyến mãi';
                message.error(errorMessage);
            } else {
                message.error('Không thể lưu khuyến mãi');
            }
        }
    };

    const handleStatusChange = async (checked: boolean, promotion: Promotion) => {
        try {
            const headers = getAuthHeader();
            if (!headers) return;

            const newStatus = checked ? 'ACTIVE' : 'DELETED';
            
            const response = await axios.delete(
                `https://beautiful-unity-production.up.railway.app/api/v1/promotions/${promotion.id}`,
                { 
                    headers: {
                        ...headers,
                        'Content-Type': 'application/json'
                    },
                    params: {
                        status: newStatus
                    }
                }
            );

            if (response.status === 200) {
                message.success(`Đã ${checked ? 'kích hoạt' : 'vô hiệu hóa'} khuyến mãi`);
                const updatedPromotions = promotions.map(p => 
                    p.id === promotion.id ? { ...p, status: newStatus as 'ACTIVE' | 'DELETED' } : p
                );
                setPromotions(updatedPromotions);
                
                const refreshResponse = await axios.get<ApiResponse>(
                    'https://beautiful-unity-production.up.railway.app/api/v1/promotions/all',
                    {
                        headers,
                        params: {
                            page: pagination.current - 1,
                            size: pagination.pageSize
                        }
                    }
                );
                
                const { data, totalElements } = refreshResponse.data;
                setPromotions(data);
                setPagination(prev => ({
                    ...prev,
                    total: totalElements
                }));
            }
        } catch (error) {
            console.error("Error updating promotion status:", error);
            message.error('Không thể cập nhật trạng thái khuyến mãi');
        }
    };

    const handleFilterChange = (key: keyof FilterType, value: string) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        let filteredData = [...allPromotions];
        
        if (newFilters.name) {
            filteredData = filteredData.filter(promo => 
                promo.name.toLowerCase().includes(newFilters.name.toLowerCase())
            );
        }

        if (newFilters.status !== 'ALL') {
            filteredData = filteredData.filter(promo => 
                promo.status === newFilters.status
            );
        }

        const paginatedData = filteredData.slice(0, pagination.pageSize);
        setPromotions(paginatedData);
        setPagination(prev => ({
            ...prev,
            current: 1,
            total: filteredData.length
        }));
    };

    const resetFilters = () => {
        setFilters({
            name: '',
            status: 'ALL'
        });
        
        const paginatedData = allPromotions.slice(0, pagination.pageSize);
        setPromotions(paginatedData);
        setPagination(prev => ({
            ...prev,
            current: 1,
            total: allPromotions.length
        }));
    };

    useEffect(() => {
        fetchPromotions();
    }, []);

    const columns: TableProps<Promotion>['columns'] = [
        {
            title: 'Tên khuyến mãi',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Mã khuyến mãi',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Mô tả',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'Giá trị tối thiểu',
            dataIndex: 'minTotal',
            key: 'minTotal',
            render: (value: number) => `${value.toLocaleString('vi-VN')} ₫`,
        },
        {
            title: 'Phần trăm giảm giá',
            dataIndex: 'discountPercent',
            key: 'discountPercent',
            render: (value: number) => `${value}%`,
        },
        {
            title: 'Ngày bắt đầu',
            dataIndex: 'dateOpen',
            key: 'dateOpen',
            render: (date: string) => {
                const parsedDate = dayjs(date, DATE_FORMAT);
                return parsedDate.isValid() ? parsedDate.format(DATE_FORMAT) : 'Invalid Date';
            },
        },
        {
            title: 'Ngày kết thúc',
            dataIndex: 'dateEnd',
            key: 'dateEnd',
            render: (date: string) => {
                const parsedDate = dayjs(date, DATE_FORMAT);
                return parsedDate.isValid() ? parsedDate.format(DATE_FORMAT) : 'Invalid Date';
            },
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status: 'ACTIVE' | 'DELETED', record: Promotion) => (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Switch
                        checked={status === 'ACTIVE'}
                        onChange={(checked) => handleStatusChange(checked, record)}
                        checkedChildren="Hoạt động"
                        unCheckedChildren="Vô hiệu"
                    />
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_: unknown, record: Promotion) => (
                <Button type="link" onClick={() => handleEdit(record)}>
                    Sửa
                </Button>
            ),
        }
    ];

    return (
        <ManagerLayout>
            <div style={{ padding: 24 }}>
                <Title level={2}>🏷️ Quản lý khuyến mãi</Title>

                <Card style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Button type="primary" onClick={() => {
                            setEditingPromotion(null);
                            form.resetFields();
                            setIsModalVisible(true);
                        }}>
                            Tạo khuyến mãi mới
                        </Button>

                        <Space size="middle">
                            <Input.Search
                                placeholder="Tìm theo tên khuyến mãi"
                                style={{ width: 250 }}
                                value={filters.name}
                                onChange={(e) => handleFilterChange('name', e.target.value)}
                                allowClear
                            />
                            <Select
                                style={{ width: 150 }}
                                value={filters.status}
                                onChange={(value) => handleFilterChange('status', value)}
                                options={[
                                    { value: 'ALL', label: 'Tất cả trạng thái' },
                                    { value: 'ACTIVE', label: 'Đang hoạt động' },
                                    { value: 'DELETED', label: 'Đã vô hiệu' }
                                ]}
                            />
                            <Button 
                                icon={<ReloadOutlined />}
                                onClick={resetFilters}
                                title="Đặt lại bộ lọc"
                            >
                                Đặt lại
                            </Button>
                        </Space>
                    </div>
                </Card>

                {loading ? (
                    <Spin size="large" />
                ) : (
                    <Table
                        columns={columns}
                        dataSource={promotions}
                        rowKey="id"
                        pagination={{
                            current: pagination.current,
                            pageSize: pagination.pageSize,
                            total: pagination.total,
                            showSizeChanger: true,
                            pageSizeOptions: pagination.pageSizeOptions,
                            showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} khuyến mãi`
                        }}
                        onChange={handleTableChange}
                    />
                )}

                <Modal
                    title={editingPromotion ? "Sửa khuyến mãi" : "Tạo khuyến mãi mới"}
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={null}
                >
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                        initialValues={{
                            minTotal: 0,
                            discountPercent: 0,
                            description: ''
                        }}
                    >
                        <Form.Item
                            name="name"
                            label="Tên khuyến mãi"
                            rules={[
                                { required: true, message: 'Vui lòng nhập tên khuyến mãi' },
                                { whitespace: true, message: 'Tên khuyến mãi không được chỉ chứa khoảng trắng' }
                            ]}
                        >
                            <Input maxLength={100} />
                        </Form.Item>

                        <Form.Item
                            name="code"
                            label="Mã khuyến mãi"
                            rules={[
                                { required: true, message: 'Vui lòng nhập mã khuyến mãi' },
                                { pattern: /^[A-Z0-9]+$/, message: 'Mã khuyến mãi chỉ được chứa chữ in hoa và số' },
                                { whitespace: true, message: 'Mã khuyến mãi không được chứa khoảng trắng' },
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();
                                        const code = value.trim().toUpperCase();
                                        
                                        if (editingPromotion && code === editingPromotion.code) {
                                            return Promise.resolve();
                                        }
                                        
                                        if (editingPromotion) {
                                            const otherCodes = existingCodes.filter(existingCode => 
                                                existingCode !== editingPromotion.code
                                            );
                                            if (otherCodes.includes(code)) {
                                                return Promise.reject(new Error('Mã khuyến mãi này đã tồn tại'));
                                            }
                                        } else {
                                            if (existingCodes.includes(code)) {
                                                return Promise.reject(new Error('Mã khuyến mãi này đã tồn tại'));
                                            }
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <Input 
                                maxLength={20}
                                style={{ textTransform: 'uppercase' }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="description"
                            label="Mô tả"
                        >
                            <Input.TextArea maxLength={500} />
                        </Form.Item>

                        <Form.Item
                            name="minTotal"
                            label="Giá trị tối thiểu"
                            rules={[
                                { required: true, message: 'Vui lòng nhập giá trị tối thiểu' },
                                { type: 'number', min: 0, message: 'Giá trị phải lớn hơn hoặc bằng 0' }
                            ]}
                        >
                            <InputNumber<number>
                                style={{ width: '100%' }}
                                min={0}
                                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                parser={(value) => {
                                    const parsed = value ? Number(value.replace(/[^\d]/g, '')) : 0;
                                    return parsed;
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="discountPercent"
                            label="Phần trăm giảm giá"
                            rules={[
                                { required: true, message: 'Vui lòng nhập phần trăm giảm giá' },
                                { type: 'number', min: 0, max: 100, message: 'Giá trị phải từ 0 đến 100' }
                            ]}
                        >
                            <InputNumber<number>
                                style={{ width: '100%' }}
                                min={0}
                                max={100}
                                precision={0}
                                step={1}
                            />
                        </Form.Item>

                        <Form.Item
                            name="dateOpen"
                            label="Ngày bắt đầu"
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày bắt đầu' },
                                {
                                    validator: async (_, value) => {
                                        if (!value) return Promise.resolve();
                                        
                                        if (editingPromotion && 
                                            dayjs(value).format(DATE_FORMAT) === dayjs(editingPromotion.dateOpen, DATE_FORMAT).format(DATE_FORMAT)) {
                                            return Promise.resolve();
                                        }

                                        const selectedDate = dayjs(value);
                                        const now = dayjs();
                                        if (selectedDate.isBefore(now)) {
                                            return Promise.reject(new Error('Thời gian bắt đầu phải từ hiện tại trở đi'));
                                        }
                                        return Promise.resolve();
                                    }
                                }
                            ]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY HH:mm:ss"
                                disabledDate={(current) => {
                                    if (editingPromotion) {
                                        return false;
                                    }
                                    return current && current < dayjs().startOf('day');
                                }}
                                disabledTime={() => {
                                    const now = dayjs();
                                    return {
                                        disabledHours: () => {
                                            if (dayjs().isSame(now, 'day')) {
                                                return Array.from({ length: now.hour() }, (_, i) => i);
                                            }
                                            return [];
                                        },
                                        disabledMinutes: (selectedHour) => {
                                            if (dayjs().isSame(now, 'day') && selectedHour === now.hour()) {
                                                return Array.from({ length: now.minute() }, (_, i) => i);
                                            }
                                            return [];
                                        },
                                        disabledSeconds: (selectedHour, selectedMinute) => {
                                            if (dayjs().isSame(now, 'day') && 
                                                selectedHour === now.hour() && 
                                                selectedMinute === now.minute()) {
                                                return Array.from({ length: now.second() }, (_, i) => i);
                                            }
                                            return [];
                                        }
                                    };
                                }}
                            />
                        </Form.Item>

                        <Form.Item
                            name="dateEnd"
                            label="Ngày kết thúc"
                            dependencies={['dateOpen']}
                            rules={[
                                { required: true, message: 'Vui lòng chọn ngày kết thúc' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                        if (!value || !getFieldValue('dateOpen')) {
                                            return Promise.resolve();
                                        }
                                        const dateOpen = dayjs(getFieldValue('dateOpen'));
                                        const dateEnd = dayjs(value);
                                        if (dateEnd.isSame(dateOpen) || dateEnd.isBefore(dateOpen)) {
                                            return Promise.reject(new Error('Ngày kết thúc phải sau ngày bắt đầu'));
                                        }
                                        return Promise.resolve();
                                    },
                                }),
                            ]}
                        >
                            <DatePicker
                                showTime={{ format: 'HH:mm:ss' }}
                                style={{ width: '100%' }}
                                format="DD/MM/YYYY HH:mm:ss"
                                disabledDate={(current) => {
                                    const dateOpen = form.getFieldValue('dateOpen');
                                    if (!dateOpen) {
                                        return current && current < dayjs().startOf('day');
                                    }
                                    const openDate = dayjs(dateOpen);
                                    return current && (current.isSame(openDate, 'day') || current.isBefore(openDate, 'day'));
                                }}
                                disabledTime={(current) => {
                                    const dateOpen = form.getFieldValue('dateOpen');
                                    if (!dateOpen || !current) return {};
                                    
                                    const openDate = dayjs(dateOpen);
                                    if (current.isSame(openDate, 'day')) {
                                        return {
                                            disabledHours: () => Array.from({ length: openDate.hour() + 1 }, (_, i) => i),
                                            disabledMinutes: (selectedHour) => {
                                                if (selectedHour === openDate.hour()) {
                                                    return Array.from({ length: openDate.minute() + 1 }, (_, i) => i);
                                                }
                                                return [];
                                            },
                                            disabledSeconds: (selectedHour, selectedMinute) => {
                                                if (selectedHour === openDate.hour() && selectedMinute === openDate.minute()) {
                                                    return Array.from({ length: openDate.second() + 1 }, (_, i) => i);
                                                }
                                                return [];
                                            }
                                        };
                                    }
                                    return {};
                                }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                                {editingPromotion ? 'Cập nhật' : 'Tạo khuyến mãi'}
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </ManagerLayout>
    );
};

const ManagerPromotionScreen: React.FC = () => {
    return (
        <ErrorBoundary>
            <ManagerPromotionContent />
        </ErrorBoundary>
    );
};

export default ManagerPromotionScreen; 