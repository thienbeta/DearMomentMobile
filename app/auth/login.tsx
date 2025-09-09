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
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Lock, LogIn, User, KeyRound, UserPlus } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Checkbox } from '@/components/ui/Checkbox';
import colors from '@/constants/colors';
import config from '@/config';

export default function LoginScreen() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
    setErrors({ username: '', password: '' });
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = { username: '', password: '' };

    if (!formData.username.trim()) {
      newErrors.username = 'Tài khoản là bắt buộc';
      isValid = false;
    }

    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = 'Mật khẩu tối thiểu 6 ký tự';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const response = await fetch(`${config.API_URL}/api/NguoiDung/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          taiKhoan: formData.username,
          matKhau: formData.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Tài khoản hoặc mật khẩu không đúng');
      }

      const userData = await response.json();
      
      // Store userId in AsyncStorage (equivalent to sessionStorage)
      await AsyncStorage.setItem('userId', userData.maNguoiDung.toString());

      // Store in AsyncStorage with a different key if rememberMe is checked (equivalent to localStorage)
      if (formData.rememberMe) {
        await AsyncStorage.setItem('userIdPersistent', userData.maNguoiDung.toString());
      }

      Alert.alert('Đăng nhập thành công', 'Chào mừng bạn trở lại!', [
        { text: 'OK', onPress: () => router.replace('/') },
      ]);
    } catch (err: any) {
      Alert.alert('Lỗi', err.message || 'Lỗi máy chủ nội bộ');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Đăng nhập vào tài khoản của bạn</Text>
          </View>

          <View style={styles.form}>
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

            <View style={styles.checkboxContainer}>
              <Checkbox
                id="rememberMe"
                checked={formData.rememberMe}
                onCheckedChange={handleCheckboxChange}
                disabled={isLoading}
              />
              <Text style={styles.checkboxLabel}>Ghi nhớ</Text>
            </View>

            <TouchableOpacity
              style={styles.forgotPasswordButton}
              onPress={() => router.push('/auth/forgot-password')}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>
                <KeyRound size={16} color={colors.primary} /> Quên mật khẩu?
              </Text>
            </TouchableOpacity>

            <Button
              title={isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
              onPress={handleLogin}
              loading={isLoading}
              fullWidth
              style={styles.loginButton}
              leftIcon={<LogIn size={20} color="#fff" />}
            />

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>Bạn chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.registerLink}>
                  <UserPlus size={16} color={colors.primary} /> Đăng ký
                </Text>
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
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  subtitle: { fontSize: 16, color: colors.textLight },
  form: { marginBottom: 24 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  checkboxLabel: { fontSize: 14, color: colors.textLight, marginLeft: 8 },
  forgotPasswordButton: { alignSelf: 'flex-end', marginBottom: 24 },
  forgotPasswordText: { color: colors.primary, fontSize: 14 },
  loginButton: { marginBottom: 16 },
  registerContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 8 },
  registerText: { color: colors.textLight, fontSize: 14 },
  registerLink: { color: colors.primary, fontSize: 14, fontWeight: '500' },
});