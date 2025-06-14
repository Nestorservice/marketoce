import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Calendar as RNCalendar } from 'react-native-calendars';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Utility function to combine styles
const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Button variants for navigation buttons
const buttonVariants = (variant?: string) => {
  if (variant === 'outline') {
    return styles.navButton;
  }
  if (variant === 'ghost') {
    return styles.dayButton;
  }
  return {};
};

interface CalendarProps {
  style?: any;
  showOutsideDays?: boolean;
  onDayPress?: (date: any) => void;
  markedDates?: any;
  [key: string]: any;
}

const Calendar: React.FC<CalendarProps> = ({
  style,
  showOutsideDays = true,
  onDayPress,
  markedDates,
  ...props
}) => {
  return (
    <View style={[styles.container, style]}>
      <RNCalendar
        renderArrow={(direction: string) => (
          <Icon
            name={direction === 'left' ? 'chevron-left' : 'chevron-right'}
            size={16}
            color="#6b7280"
          />
        )}
        theme={{
          calendarBackground: '#fff',
          textSectionTitleColor: '#6b7280',
          dayTextColor: '#111827',
          todayTextColor: '#2563eb',
          selectedDayBackgroundColor: '#2563eb',
          selectedDayTextColor: '#fff',
          monthTextColor: '#111827',
          textDisabledColor: '#d1d5db',
          arrowColor: '#6b7280',
          textDayFontSize: 14,
          textMonthFontSize: 16,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
        hideExtraDays={!showOutsideDays}
        onDayPress={(day) => onDayPress?.(day)}
        markedDates={markedDates}
        {...props}
      />
    </View>
  );
};

Calendar.displayName = 'Calendar';

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  calendar: {
    width: '100%',
  },
  navButton: {
    width: 28,
    height: 28,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0.5,
  },
  dayButton: {
    width: 36,
    height: 36,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { Calendar };