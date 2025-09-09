import React from 'react';
   import { TouchableOpacity, View, StyleSheet } from 'react-native';
   import { Check } from 'lucide-react-native';
   import colors from '@/constants/colors';

   interface CheckboxProps {
     id?: string;
     checked: boolean;
     onCheckedChange: (checked: boolean) => void;
     disabled?: boolean;
   }

   export const Checkbox: React.FC<CheckboxProps> = ({ id, checked, onCheckedChange, disabled }) => {
     return (
       <TouchableOpacity
         style={[
           styles.checkbox,
           checked && styles.checkboxChecked,
           disabled && styles.checkboxDisabled,
         ]}
         onPress={() => !disabled && onCheckedChange(!checked)}
         activeOpacity={0.7}
       >
         {checked && <Check size={16} color="#fff" />}
       </TouchableOpacity>
     );
   };

   const styles = StyleSheet.create({
     checkbox: {
       width: 20,
       height: 20,
       borderRadius: 4,
       borderWidth: 2,
       borderColor: colors.border,
       justifyContent: 'center',
       alignItems: 'center',
     },
     checkboxChecked: {
       backgroundColor: colors.primary,
       borderColor: colors.primary,
     },
     checkboxDisabled: {
       opacity: 0.5,
     },
   });