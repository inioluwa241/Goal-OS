import { Colors } from "@/constants/theme";
import { useEffect, useState } from "react";
import {
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  useColorScheme,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { ThemedText } from "./themed-text";

const CalendarComponent = function ({
  onSelect,
  initialDateString,
}: {
  onSelect: (pickedDate: string | undefined) => void;
  initialDateString: string;
}) {
  const scheme = useColorScheme() ?? "light";
  const c = Colors[scheme];

  const [selectedDate, setSelectedDate] = useState<string | null>(
    initialDateString,
  );
  const [currentMonth, setCurrentMonth] = useState(initialDateString);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setSelectedDate(initialDateString);
    setCurrentMonth(initialDateString);
  }, [initialDateString]);

  return (
    <View>
      <TouchableOpacity
        style={{
          borderWidth: 1,
          borderColor: !show ? c.accent : c.border,
          borderRadius: 7,
          backgroundColor: c.card,
          paddingVertical: 10,
          paddingHorizontal: 10,
        }}
        onPress={() => {
          show ? setShow(false) : setShow(true);
        }}
      >
        <ThemedText textType="default">
          {selectedDate ?? "Select a date"}
        </ThemedText>
      </TouchableOpacity>

      {show && (
        <TouchableWithoutFeedback onPress={() => {}}>
          <Calendar
            key={currentMonth.substring(0, 7)}
            current={currentMonth}
            onMonthChange={(month) => setCurrentMonth(month.dateString)}
            style={{
              borderRadius: 12,
              borderWidth: 1,
              borderColor: c.accent,
              overflow: "hidden", // makes borderRadius actually show
            }}
            theme={{
              backgroundColor: c.background,
              calendarBackground: c.background,
              textSectionTitleColor: c.mutedForeground,
              selectedDayBackgroundColor: c.accent,
              selectedDayTextColor: "#ffffff",
              todayTextColor: c.background,
              dayTextColor: c.foreground,
              textDisabledColor: "#ccc",
              arrowColor: c.foreground,
              monthTextColor: c.foreground,
              textDayFontWeight: "400",
              textMonthFontWeight: "bold",
              textDayHeaderFontWeight: "600",
              textDayFontSize: 14,
              textMonthFontSize: 20,
              todayBackgroundColor: c.foreground,
            }}
            onDayPress={(day) => {
              setSelectedDate(day.dateString); // e.g "2026-04-01"
              console.log(day);
              // setShow(false); // closes after picking
            }}
            markedDates={{
              [selectedDate as string]: {
                selected: true,
                selectedColor: c.accent,
              },
            }}
            dayComponent={({ date, state, marking }) => {
              const isToday = state === "today";
              return (
                <TouchableOpacity
                  onPress={() => {
                    onSelect(date?.dateString);
                    setSelectedDate(date?.dateString as string);
                  }}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 4, // change to 0 for sharp square
                    backgroundColor: marking?.selected
                      ? c.accent
                      : isToday
                        ? c.foreground
                        : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: marking?.selected
                        ? "#fff"
                        : isToday
                          ? c.background
                          : state === "disabled"
                            ? "#ccc"
                            : c.foreground,
                      fontSize: 14,
                    }}
                  >
                    {date?.day}
                  </Text>
                </TouchableOpacity>
              );
            }}
          />
        </TouchableWithoutFeedback>
      )}
    </View>
  );
};

export default CalendarComponent;
