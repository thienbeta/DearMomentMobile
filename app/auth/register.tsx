import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Mail, Lock, User, UserPlus, ChevronLeft } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import config from '@/config';

export default function RegisterScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
    vaiTro: 0, // Default to Customer
  });
  const [errors, setErrors] = useState({
    fullName: '',
    email: '',
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      fullName: '',
      email: '',
      username: '',
      password: '',
    };

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ tên không được để trống';
      isValid = false;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Vui lòng nhập email';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
      isValid = false;
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Tài khoản không được để trống';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Vui lòng nhập mật khẩu';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    const formDataPayload = new FormData();
    formDataPayload.append('HoTen', formData.fullName.trim());
    formDataPayload.append('Email', formData.email.trim());
    formDataPayload.append('TaiKhoan', formData.username.trim());
    formDataPayload.append('MatKhau', formData.password);
    formDataPayload.append('VaiTro', formData.vaiTro.toString());

    try {
      const response = await fetch(`${config.API_URL}/api/NguoiDung`, {
        method: 'POST',
        body: formDataPayload,
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.Message || Object.values(errorData.errors || {}).flat().join('; ') || 'Đã xảy ra lỗi khi đăng ký';
        throw new Error(errorMessage);
      }

      await response.json();
      Alert.alert('Đăng ký thành công', 'Vui lòng đăng nhập.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi máy chủ nội bộ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.keyboardAvoidingView}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.title}>Tạo tài khoản</Text>
          </View>

          <View style={styles.form}>
            <Input
              label="Họ tên"
              placeholder="Nhập họ và tên"
              value={formData.fullName}
              onChangeText={(text) => handleChange('fullName', text)}
              autoCapitalize="words"
              error={errors.fullName}
              leftIcon={<User size={20} color={colors.textLight} />}
            />

            <Input
              label="Email"
              placeholder="Nhập email"
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              keyboardType="email-address"
              autoCapitalize="none"
              error={errors.email}
              leftIcon={<Mail size={20} color={colors.textLight} />}
            />

            <Input
              label="Tài khoản"
              placeholder="Nhập tài khoản"
              value={formData.username}
              onChangeText={(text) => handleChange('username', text)}
              autoCapitalize="none"
              error={errors.username}
              leftIcon={<User size={20} color={colors.textLight} />}
            />

            <Input
              label="Mật khẩu"
              placeholder="Nhập mật khẩu"
              value={formData.password}
              onChangeText={(text) => handleChange('password', text)}
              secureTextEntry
              error={errors.password}
              leftIcon={<Lock size={20} color={colors.textLight} />}
            />

            <Button
              title={isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
              onPress={handleRegister}
              loading={isLoading}
              fullWidth
              style={styles.registerButton}
              leftIcon={<UserPlus size={20} color="#fff" />}
            />

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Đã có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Đăng nhập</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  keyboardAvoidingView: { flex: 1 },
  scrollContent: { flexGrow: 1, padding: 24 },
  backButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textLight },
  form: { marginBottom: 24 },
  registerButton: { marginTop: 24, marginBottom: 16 },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  loginText: { color: colors.textLight, fontSize: 14 },
  loginLink: { color: colors.primary, fontSize: 14, fontWeight: '500' },
});