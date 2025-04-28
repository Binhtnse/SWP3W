/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { Form, Input, Button, Typography, Modal, message, Alert } from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "antd/dist/reset.css";

const { Title, Text } = Typography;

const animatedTextStyle: React.CSSProperties = {
  fontSize: 25,
  fontWeight: 700,
  animation: "fadeIn 1.5s ease-in-out",
  display: "inline-block",
};

const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [isResetVisible, setIsResetVisible] = useState(false);
  const [emailForReset, setEmailForReset] = useState("");
  const [loginStatus, setLoginStatus] = useState<"success" | "error" | null>(null);
  const [loginMessage, setLoginMessage] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (values: any) => {
    setIsLoggingIn(true); // ✅ Bắt đầu loading
    try {
      const response = await axios.post(
        "https://beautiful-unity-production.up.railway.app/api/authentication/login",
        {
          email: values.username,
          password: values.password,
        }
      );

      if (response.status === 200) {
        const { email, role, accessToken, id, fullNmae } = response.data;

        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("userEmail", email);
        localStorage.setItem("userRole", role);
        localStorage.setItem("userId", id);
        localStorage.setItem("userFullName", fullNmae);

        setLoginStatus("success");
        setLoginMessage(`🎉 Đăng nhập thành công! Chào mừng ${email} đến với Trà sữa ngọt ngào!`);

        setTimeout(() => {
          setLoginStatus(null);
          setLoginMessage("");
          setIsLoggingIn(false);
          if (role === "STAFF") {
            navigate("/staff/products");
          } else if (role === "ADMIN") {
            navigate("/admin/dashboard");
          } else if (role === "MANAGER") {
            navigate("/manager/manageIncome");
          }
        }, 1500);
      } else {
        setLoginStatus("error");
        setLoginMessage("❌ Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin đăng nhập.");
        setTimeout(() => {
          setLoginStatus(null);
          setLoginMessage("");
          setIsLoggingIn(false);
        }, 1000);
      }
    } catch (error: any) {
      setLoginStatus("error");
      setLoginMessage("❌ Có lỗi xảy ra. Vui lòng thử lại sau.");
      console.error(error);
      setTimeout(() => {
        setLoginStatus(null);
        setLoginMessage("");
        setIsLoggingIn(false);
      }, 1000);
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
          <Text type="secondary" style={animatedTextStyle}>
            🌸 Trà sữa ngọt ngào 🌸
          </Text>
          <Title level={3} style={{ margin: 0 }}>
            Đăng nhập hệ thống
          </Title>
        </div>

        
        {loginStatus && (
          <Alert
            message={loginMessage}
            type={loginStatus}
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

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
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLoggingIn} // ✅ loading khi đăng nhập
            >
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
