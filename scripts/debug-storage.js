
const { Client, Databases, Storage, Query } = require('node-appwrite');
require('dotenv').config();

const ENDPOINT = process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1';
const PROJECT_ID = process.env.APPWRITE_PROJECT_ID;
const API_KEY = process.env.APPWRITE_API_KEY;
const DATABASE_ID = process.env.APPWRITE_DATABASE_ID || 'travelling_db';
const BUCKET_ID = 'travel_documents';

if (!API_KEY) { console.error("Missing API Key"); process.exit(1); }

const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(API_KEY);

const storage = new Storage(client);
const databases = new Databases(client);

async function debug() {
    console.log("🔍 Debugging Storage & DB...");
    
    // 1. List Files in Bucket
    console.log(`\n📂 Files in Bucket '${BUCKET_ID}':`);
    try {
        const fileList = await storage.listFiles(BUCKET_ID);
        if (fileList.total === 0) {
            console.log("   (No files found)");
        } else {
            fileList.files.forEach(f => {
                console.log(`   - FileID: ${f.$id} | Name: ${f.name} | Size: ${f.sizeOriginal}`);
            });
        }
    } catch (e) {
        console.error("   ❌ Error listing files:", e.message);
    }

    // 2. List Documents in DB
    console.log(`\n📄 Metadata in Database (documents collection):`);
    try {
        const docList = await databases.listDocuments(DATABASE_ID, 'documents');
        if (docList.total === 0) {
            console.log("   (No documents found)");
        } else {
            docList.documents.forEach(d => {
                console.log(`   - DocID: ${d.$id} | FileID: ${d.fileId} | Name: ${d.fileName} | URL: ${d.fileUrl}`);
            });
        }
    } catch (e) {
        console.error("   ❌ Error listing db docs:", e.message);
    }
}

debug();
