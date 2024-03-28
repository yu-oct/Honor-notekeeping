// 在 api.ts 文件中

export const deleteTodo = async (todoId: string, token: string) => {
    try {
        const response = await fetch(`http://localhost:3001/api/todos/${todoId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to delete todo');
        }
    } catch (error) {
        throw new Error('Failed to delete todo');
    }
};

export async function deleteTag(tagId: string, token: string): Promise<void> {
    try {
        const response = await fetch(`http://localhost:3001/api/tags/${tagId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`, // 传递认证令牌
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            console.log('Tag deleted successfully');
            // 在此处执行任何删除成功后的逻辑，例如刷新待办事项列表等
        } else {
            console.error('Failed to delete tag:', data.message);
            // 在此处处理删除失败的逻辑，例如显示错误消息给用户
        }
    } catch (error) {
        console.error('Error deleting tag:', error);
        // 在此处处理任何异常情况，例如显示错误消息给用户
    }
}
