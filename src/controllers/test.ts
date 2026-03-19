import supabase from "../config/supabase.js";

async function testFetch(): Promise<any> {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    if (error) throw error;
    return data;
}

async function main() {
    console.log(await testFetch());
}

main();