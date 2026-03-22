import supabase from "../config/supabase.js";

export async function createUser(name: string, gmail: string) {
    const { data, error } = await supabase
        .from('users')
        .insert([{ name, gmail }])
        .select();
    if (error) throw error;
    return data;
}

export async function login(gmail: string) {
    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('gmail', gmail);
    if (error) throw error;
    return data;
}

export async function getUserId(gmail: string) {
    const { data, error } = await supabase
        .from('users')
        .select('user_id')
        .eq('gmail', gmail);
    if (error) throw error;
    return data;
}

export async function checkExistingGmail(gmail: string) {
    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('gmail', gmail);
    if (error) throw error;
    return data;
}

export async function getUserByUserId(userId: string) {
    const { data, error } = await supabase
        .from('users')
        .select()
        .eq('user_id', userId);
    if (error) throw error;
    return data;
}