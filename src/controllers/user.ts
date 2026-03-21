import supabase from "../config/supabase.js";

export async function createUser(name: string, gmail: string) {
    const { data, error } = await supabase
        .from('users')
        .insert([{ name, gmail }])
        .select();
    if (error) throw error;
    return data;
}