import supabase from "../config/supabase.js";

// 1. Create a message. groupId is optional (but typically provided)
export async function createMessage(userId: string, role: string, context: string, groupId?: number) {
    const insertData: any = { user_id: userId, role, context };
    if (groupId) {
        insertData.group_id = groupId;
    }

    const { data, error } = await supabase
        .from('messages')
        .insert([insertData])
        .select();
    if (error) throw error;
    return data[0];
}

// 2. Create a new group in group_messages (doesn't need messageId anymore)
export async function createGroup(groupName: string) {
    const { data, error } = await supabase
        .from('group_messages')
        .insert([{ group_name: groupName }])
        .select();
    if (error) throw error;
    return data[0];
}

// 3. Get all messages for user
export async function getMessagesByUserId(userId: string) {
    const { data, error } = await supabase
        .from('messages')
        .select(`*, group_messages(group_id, group_name)`)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
    if (error) throw error;
    return data;
}

// 4. Delete messages by User ID (legacy clear all)
export async function deleteMessagesByUserId(userId: string) {
    const { data, error } = await supabase
        .from('messages')
        .delete()
        .eq('user_id', userId);
    if (error) throw error;
    return data;
}

// 5. Delete specific group by Group ID
export async function deleteGroupById(groupId: number) {
    // Note: If you don't have cascade delete on the foreign key, 
    // you must delete messages first before deleting the group_messages row.
    await supabase.from('messages').delete().eq('group_id', groupId);
    const { data, error } = await supabase
        .from('group_messages')
        .delete()
        .eq('group_id', groupId);
    if (error) throw error;
    return data;
}
