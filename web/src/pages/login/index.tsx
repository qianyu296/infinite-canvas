import { useState } from "react";
import { Lock, User } from "lucide-react";
import { Button, Form, Input, Typography, Modal, message } from "antd";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { useAuthStore } from "@/stores/use-auth-store";
import { apiClient } from "@/services/api/request";

export default function LoginPage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [registerOpen, setRegisterOpen] = useState(false);
    const [form] = Form.useForm();
    const [registerForm] = Form.useForm();
    const login = useAuthStore((state) => state.login);
    const user = useAuthStore((state) => state.user);

    if (user) {
        navigate("/");
        return null;
    }

    const handleLogin = async (values: { username: string; password: string }) => {
        setLoading(true);
        try {
            const response = await apiClient.post("/api/auth/login", values);
            const { token, user: userData } = response.data;
            login(token, userData);
            message.success(t("auth.login.success"));
            navigate("/");
        } catch (error: any) {
            const msg = error.response?.data?.error || t("auth.login.failed");
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (values: { username: string; password: string; displayName: string }) => {
        setLoading(true);
        try {
            const response = await apiClient.post("/api/auth/register", values);
            const { token, user: userData } = response.data;
            login(token, userData);
            message.success(t("auth.register.success"));
            navigate("/");
        } catch (error: any) {
            const msg = error.response?.data?.error || t("auth.register.failed");
            message.error(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex h-dvh items-center justify-center bg-background">
            <div className="w-full max-w-md px-6">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-stone-950 dark:text-stone-100">{t("meta.title")}</h1>
                    <p className="mt-2 text-sm text-stone-500">{t("auth.welcome")}</p>
                </div>
                <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-900">
                    <Form form={form} layout="vertical" requiredMark={false} initialValues={{ remember: true }}>
                        <Form.Item label={t("auth.username")} name="username" rules={[{ required: true, message: t("auth.usernameRequired") }, { min: 3, message: t("auth.usernameMin") }]}>
                            <Input prefix={<User size={16} />} placeholder={t("auth.usernamePlaceholder")} />
                        </Form.Item>
                        <Form.Item label={t("auth.password")} name="password" rules={[{ required: true, message: t("auth.passwordRequired") }, { min: 6, message: t("auth.passwordMin") }]}>
                            <Input.Password prefix={<Lock size={16} />} placeholder={t("auth.passwordPlaceholder")} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} block size="large" onClick={() => form.submit()}>
                                {t("auth.login")}
                            </Button>
                        </Form.Item>
                    </Form>
                    <div className="mt-4 text-center text-sm text-stone-500">
                        {t("auth.noAccount")}{" "}
                        <Button type="link" size="small" onClick={() => setRegisterOpen(true)}>
                            {t("auth.register")}
                        </Button>
                    </div>
                </div>
            </div>
            <Modal open={registerOpen} title={t("auth.register")} onCancel={() => setRegisterOpen(false)} footer={null} destroyOnClose>
                <Form form={registerForm} layout="vertical" requiredMark={false} style={{ marginTop: 16 }}>
                    <Form.Item label={t("auth.displayName")} name="displayName" rules={[{ required: true, message: t("auth.displayNameRequired") }]}>
                        <Input placeholder={t("auth.displayNamePlaceholder")} />
                    </Form.Item>
                    <Form.Item label={t("auth.username")} name="username" rules={[{ required: true, message: t("auth.usernameRequired") }, { min: 3, message: t("auth.usernameMin") }]}>
                        <Input prefix={<User size={16} />} placeholder={t("auth.usernamePlaceholder")} />
                    </Form.Item>
                    <Form.Item label={t("auth.password")} name="password" rules={[{ required: true, message: t("auth.passwordRequired") }, { min: 6, message: t("auth.passwordMin") }]}>
                        <Input.Password prefix={<Lock size={16} />} placeholder={t("auth.passwordPlaceholder")} />
                    </Form.Item>
                    <Button type="primary" block loading={loading} onClick={() => registerForm.submit()}>
                        {t("auth.register")}
                    </Button>
                </Form>
            </Modal>
        </div>
    );
}
