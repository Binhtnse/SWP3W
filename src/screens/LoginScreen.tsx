/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Form, Input, Button, Typography, Modal, message } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "antd/dist/reset.css";

const { Title, Text } = Typography;

const animatedTextStyle: React.CSSProperties = {
  fontSize: 25,
  fontWeight: 700,
  animation: "fadeIn 1.5s ease-in-out",
  display: "inline-block"
};

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    try {
      const response = await axios.post("https://beautiful-unity-production.up.railway.app/api/authentication/login", {
        email: values.username,
        password: values.password,
      });

      if (response.status === 200) {
        const { email, role, accessToken } = response.data;

        // Lưu thông tin người dùng
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);

        message.success(`🎉 Đăng nhập thành công! Chào mừng ${email} đến với Trà sữa ngọt ngào!`);


        navigate("/dashboard");
      } else {
        message.error("❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        message.error("⚠️ Tài khoản hoặc mật khẩu không chính xác.");
      } else if (error.response?.status === 400) {
        message.error("⚠️ Yêu cầu không hợp lệ. Vui lòng kiểm tra dữ liệu gửi đi.");
      } else if (error.response?.status === 500) {
        message.error("❌ Lỗi hệ thống. Vui lòng thử lại sau.");
      } else {
        message.error(
          error?.response?.data?.message ||
          "❌ Đăng nhập không thành công. Vui lòng kiểm tra lại email và mật khẩu."
        );
      }
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
      <style>
        {`
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(-10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
      <div
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: 32,
          borderRadius: 30,
          boxShadow: "0 40px 20px rgba(0, 0, 0, 0.2)",
          minWidth: 500,
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 12 }}>
          <Text type="secondary" style={animatedTextStyle}>🌸 Trà sữa ngọt ngào 🌸</Text>
          <Title level={3} style={{ margin: 0 }}>Đăng nhập hệ thống</Title>
          
        </div>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleLogin}
          initialValues={{ remember: true }}
        >
          <Form.Item
            name="username"
            label="Email đăng nhập"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              {
                type: "email",
                message: "Email không hợp lệ! Vui lòng nhập đúng định dạng.",
              },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" />
          </Form.Item>

          <Form.Item
            name="password"
            label="Mật khẩu"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu!" },
              {
                min: 6,
                message: "Mật khẩu phải có ít nhất 6 ký tự.",
              },
            ]}
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
        open={isResetVisible}
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
