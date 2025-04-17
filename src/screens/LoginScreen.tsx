/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Form, Input, Button, Typography, Modal, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";

const { Title } = Typography;

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");

  const handleLogin = (values: any) => {
    const { username, password } = values;
    if (username === "admin" && password === "123456") {
      message.success("Đăng nhập thành công!");
    } else {
      message.error("Tên đăng nhập hoặc mật khẩu không đúng.");
    }
  };

  const handleResetPassword = () => {
    if (emailForReset) {
      message.success("Đã gửi liên kết đặt lại mật khẩu đến email của bạn.");
      setIsResetVisible(false);
    } else {
      message.error("Vui lòng nhập email.");
    }
  };

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage:
          'url("https://static.kinhtedouong.vn/w640/images/upload/04162023/best-bubble-tea-flavors-body-image-1_189300e4.jpg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 32,
          borderRadius: 30,
          boxShadow: "0 40px 20px rgba(0, 0, 0, 0.2)",
          minWidth: 500,
        }}
      >
        <Title level={3} style={{ textAlign: "center" }}>
          Đăng nhập hệ thống
        </Title>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            label="Tên đăng nhập"
            rules={[{ required: true, message: "Vui lòng nhập tên đăng nhập!" }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Tên đăng nhập" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Mật khẩu" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đăng nhập
            </Button>
          </Form.Item>

          <div style={{ textAlign: "center" }}>
            <a onClick={() => setIsResetVisible(true)}>Quên mật khẩu?</a>
          </div>
        </Form>
      </div>

      <Modal
        title="Đặt lại mật khẩu"
        visible={isResetVisible}
        onOk={handleResetPassword}
        onCancel={() => setIsResetVisible(false)}
        okText="Gửi"
        cancelText="Hủy"
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="Nhập email của bạn"
          value={emailForReset}
          onChange={(e) => setEmailForReset(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default LoginPage;
