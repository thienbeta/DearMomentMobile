import React, { useState, useEffect } from 'react';
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
import { Mail, ChevronLeft, ArrowRight, KeyRound, Check, Lock, Key, Eye, EyeOff } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import colors from '@/constants/colors';
import config from '@/config';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ForgotPasswordStep = 'email' | 'otp' | 'newPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [step, setStep] = useState<ForgotPasswordStep>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(async () => {
      await AsyncStorage.removeItem('forgotPasswordEmail');
      await AsyncStorage.removeItem('forgotPasswordOtp');
      if (step !== 'newPassword') {
        setStep('email');
        setEmail('');
        setOtp('');
        setError('Phiên OTP đã hết hạn. Vui lòng bắt đầu lại.');
      }
    }, 10 * 60 * 1000); // 10 minutes

    return () => clearTimeout(timeout);
  }, [step]);

  const handleEmailSubmit = async () => {
    setError('');
    if (!email.trim()) {
      setError('Email là bắt buộc');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Email không hợp lệ');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/NguoiDung/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(email.trim()),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Không thể gửi OTP. Vui lòng thử lại.');
      }

      await AsyncStorage.setItem('forgotPasswordEmail', email.trim());
      setStep('otp');
    } catch (err: any) {
      setError(err.message || 'Lỗi máy chủ nội bộ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpSubmit = async () => {
    setError('');
    if (!otp.trim()) {
      setError('Mã OTP là bắt buộc');
      return;
    }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) {
      setError('Mã OTP phải là 6 chữ số');
      return;
    }

    setIsLoading(true);
    await AsyncStorage.setItem('forgotPasswordOtp', otp.trim());
    setStep('newPassword');
    setIsLoading(false);
  };

  const handlePasswordSubmit = async () => {
    setError('');
    if (!newPassword) {
      setError('Mật khẩu mới là bắt buộc');
      return;
    }
    if (newPassword.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    const storedEmail = await AsyncStorage.getItem('forgotPasswordEmail');
    const storedOtp = await AsyncStorage.getItem('forgotPasswordOtp');

    if (!storedEmail || !storedOtp) {
      setError('Dữ liệu phiên không hợp lệ. Vui lòng bắt đầu lại.');
      setStep('email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/NguoiDung/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: storedEmail,
          otp: storedOtp,
          matKhauMoi: newPassword,
          xacNhanMatKhau: confirmPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const errorMessage = errorData.Message || Object.values(errorData.errors || {}).flat().join('; ') || 'Không thể đặt lại mật khẩu.';
        throw new Error(errorMessage);
      }

      await AsyncStorage.removeItem('forgotPasswordEmail');
      await AsyncStorage.removeItem('forgotPasswordOtp');
      Alert.alert('Thành công', 'Mật khẩu đã được đặt lại.', [
        { text: 'Đăng nhập', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (err: any) {
      setError(err.message || 'Lỗi máy chủ nội bộ');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    const storedEmail = await AsyncStorage.getItem('forgotPasswordEmail');
    if (!storedEmail) {
      setError('Không tìm thấy email. Vui lòng bắt đầu lại.');
      setStep('email');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`${config.API_URL}/api/NguoiDung/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(storedEmail),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.Message || 'Không thể gửi lại OTP. Vui lòng thử lại.');
      }

      setError('Đã gửi lại OTP. Vui lòng kiểm tra email.');
    } catch (err: any) {
      setError(err.message || 'Lỗi máy chủ nội bộ');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.title}>Quên mật khẩu</Text>
      <Text style={styles.subtitle}>Nhập email để nhận mã OTP</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Input
        label="Email"
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        error={error}
        leftIcon={<Mail size={20} color={colors.textLight} />}
        disabled={isLoading}
      />
      <Button
        title={isLoading ? 'Đang xử lý...' : 'Gửi mã OTP'}
        onPress={handleEmailSubmit}
        loading={isLoading}
        fullWidth
        style={styles.submitButton}
        leftIcon={<KeyRound size={18} color="#fff" />}
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.title}>Nhập mã OTP</Text>
      <Text style={styles.subtitle}>Nhập mã xác nhận đã gửi đến email của bạn</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Input
        label="Mã OTP"
        placeholder="Nhập mã OTP"
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        error={error}
        leftIcon={<Key size={20} color={colors.textLight} />}
        disabled={isLoading}
        style={styles.otpInput}
      />
      <Button
        title={isLoading ? 'Đang xử lý...' : 'Xác nhận mã'}
        onPress={handleOtpSubmit}
        loading={isLoading}
        fullWidth
        style={styles.submitButton}
        leftIcon={<Check size={18} color="#fff" />}
      />
      <TouchableOpacity
        style={styles.resendLink}
        onPress={handleResendOtp}
        disabled={isLoading}
      >
        <Text style={styles.resendText}>
          <KeyRound size={16} color={colors.primary} /> Gửi lại OTP
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.resendLink}
        onPress={() => setStep('email')}
        disabled={isLoading}
      >
        <Text style={styles.resendText}>
          <ChevronLeft size={16} color={colors.primary} /> Quay lại email
        </Text>
      </TouchableOpacity>
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.title}>Đặt lại mật khẩu</Text>
      <Text style={styles.subtitle}>Tạo mật khẩu mới an toàn</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Input
        label="Mật khẩu mới"
        placeholder="Nhập mật khẩu mới"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!showPassword}
        error={error}
        leftIcon={<Lock size={20} color={colors.textLight} />}
        rightIcon={
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? <EyeOff size={20} color={colors.textLight} /> : <Eye size={20} color={colors.textLight} />}
          </TouchableOpacity>
        }
        disabled={isLoading}
      />
      <Input
        label="Xác nhận mật khẩu"
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showConfirmPassword}
        error={error}
        leftIcon={<Lock size={20} color={colors.textLight} />}
        rightIcon={
          <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
            {showConfirmPassword ? <EyeOff size={20} color={colors.textLight} /> : <Eye size={20} color={colors.textLight} />}
          </TouchableOpacity>
        }
        disabled={isLoading}
      />
      <Button
        title={isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
        onPress={handlePasswordSubmit}
        loading={isLoading}
        fullWidth
        style={styles.submitButton}
        leftIcon={<Lock size={18} color="#fff" />}
      />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <ChevronLeft size={24} color={colors.text} />
          </TouchableOpacity>
          <View style={styles.form}>
            {step === 'email' && renderStep1()}
            {step === 'otp' && renderStep2()}
            {step === 'newPassword' && renderStep3()}
            <TouchableOpacity
              style={styles.backToLoginContainer}
              onPress={() => router.push('/auth/login')}
              disabled={isLoading}
            >
              <Text style={styles.backToLoginText}>Quay lại đăng nhập</Text>
              <ArrowRight size={16} color={colors.primary} />
            </TouchableOpacity>
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
  title: { fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8, textAlign: 'center' },
  subtitle: { fontSize: 16, color: colors.textLight, lineHeight: 24, marginBottom: 16, textAlign: 'center' },
  form: { flex: 1 },
  submitButton: { marginTop: 8, marginBottom: 16 },
  backToLoginContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 16 },
  backToLoginText: { color: colors.primary, fontSize: 16, fontWeight: '500', marginRight: 8 },
  resendLink: { alignSelf: 'center', marginTop: 8 },
  resendText: { color: colors.primary, fontSize: 14 },
  error: { color: colors.error || '#FF0000', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  otpInput: { textAlign: 'center', fontSize: 18, letterSpacing: 4 },
});