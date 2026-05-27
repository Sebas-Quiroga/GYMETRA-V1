import { ref, computed } from 'vue';

export const usePaginator = <T>(items: { value: T[] }, initialPageSize: number = 10) => {
  const currentPageIndex = ref(1);
  const itemsPerPageCount = ref(initialPageSize);

  const totalItemsCount = computed(() => items.value.length);
  const totalPagesCount = computed(() => Math.ceil(totalItemsCount.value / itemsPerPageCount.value));
  
  const startItemIndex = computed(() => (currentPageIndex.value - 1) * itemsPerPageCount.value + 1);
  const endItemIndex = computed(() => Math.min(currentPageIndex.value * itemsPerPageCount.value, totalItemsCount.value));

  const paginatedItems = computed(() => {
    const startIndex = (currentPageIndex.value - 1) * itemsPerPageCount.value;
    const endIndex = startIndex + itemsPerPageCount.value;
    return items.value.slice(startIndex, endIndex);
  });

  const visiblePagesList = computed(() => {
    const pages = [];
    const maxVisiblePages = 5;
    let start = Math.max(1, currentPageIndex.value - Math.floor(maxVisiblePages / 2));
    let end = Math.min(totalPagesCount.value, start + maxVisiblePages - 1);

    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  });

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPagesCount.value) {
      currentPageIndex.value = pageNumber;
    }
  };

  return {
    currentPageIndex,
    itemsPerPageCount,
    totalItemsCount,
    totalPagesCount,
    startItemIndex,
    endItemIndex,
    paginatedItems,
    visiblePagesList,
    goToPage
  };
};
