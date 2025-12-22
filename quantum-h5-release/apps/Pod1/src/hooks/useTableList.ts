import { reactive, ref } from 'vue';

/**
 * @description 方便使用antd表格，提供了分页自动处理功能
 * @param request 请求方法
 * @param deps 表格重置的依赖项，任意依赖项发生变化，重置页码为1，自动调用request方法
 * @param Options 自定义选项
 * @returns Result<T>
 */
export default function useAntdTable<T>(
    request: (params: { pageNum: number, pageSize: number }) => Promise<{ data: T[]; totalNum: number }>,
    deps: keyof T,
    tableProps: { pageSize?: number },
    options: { isInit?: boolean },
){
    const dataList = ref([]); // 列表
    const total = ref(0); // 总数
    const pageParams = reactive({
        pageNum: 1,
        pageSize: tableProps.pageSize || 10,
    });
    const fetchData = async () => {
        const { data, totalNum } = await request(pageParams);
        dataList.value = data;
        total.value = totalNum;
    };
}