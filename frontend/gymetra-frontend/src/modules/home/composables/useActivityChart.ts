import { ref } from 'vue';

export function useActivityChart() {
  const activityChartData = ref([
    { day: "L", height: 60, isActive: false },
    { day: "M", height: 80, isActive: false },
    { day: "X", height: 50, isActive: false },
    { day: "J", height: 100, isActive: false },
    { day: "V", height: 70, isActive: false },
    { day: "S", height: 90, isActive: false },
    { day: "D", height: 30, isActive: false },
  ]);

  const updateChartDayHighlight = () => {
    const dayLetters = ["D", "L", "M", "X", "J", "V", "S"];
    const currentDayLetter = dayLetters[new Date().getDay()];
    
    activityChartData.value = activityChartData.value.map(bar => ({ 
      ...bar, 
      isActive: bar.day === currentDayLetter 
    }));
  };

  return {
    activityChartData,
    updateChartDayHighlight
  };
}
