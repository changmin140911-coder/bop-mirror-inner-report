import { cert, getApps, initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import type { AnalysisPayload, HistoryItem, ReportData } from "@/lib/report-types";

function getFirebaseConfig() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  if (!projectId || !clientEmail || !privateKey) {
    return null;
  }

  return { projectId, clientEmail, privateKey, storageBucket };
}

export function isFirebaseConfigured() {
  return Boolean(getFirebaseConfig());
}

function getFirebaseApp() {
  const config = getFirebaseConfig();
  if (!config) {
    return null;
  }

  if (getApps().length > 0) {
    return getApps()[0];
  }

  return initializeApp({
    credential: cert({
      projectId: config.projectId,
      clientEmail: config.clientEmail,
      privateKey: config.privateKey
    }),
    storageBucket: config.storageBucket
  });
}

export async function uploadGeneratedImage(
  reportId: string,
  base64Data: string,
  contentType = "image/png"
) {
  const app = getFirebaseApp();
  const config = getFirebaseConfig();

  if (!app || !config?.storageBucket) {
    return null;
  }

  const bucket = getStorage(app).bucket(config.storageBucket);
  const extension = contentType === "image/webp" ? "webp" : "png";
  const storagePath = `reports/${reportId}/generated-moodboard.${extension}`;
  const file = bucket.file(storagePath);

  await file.save(Buffer.from(base64Data, "base64"), {
    resumable: false,
    contentType,
    metadata: {
      cacheControl: "private, max-age=0, no-transform"
    }
  });

  return storagePath;
}

export async function saveReportToFirebase(
  report: ReportData,
  payload: AnalysisPayload,
  diagnostics: { generatedImageStored: boolean }
) {
  const app = getFirebaseApp();
  if (!app || !payload.consentToStore) {
    return null;
  }

  const db = getFirestore(app);
  const docId = report.id;
  if (!docId) {
    return null;
  }

  const storedReport: ReportData = {
    ...report,
    generatedImage: report.generatedImage
      ? {
          ...report.generatedImage,
          dataUrl: null
        }
      : undefined,
    visuals: report.visuals
      ? {
          ...report.visuals,
          sourceUserImage: null,
          heroImage: null,
          generatedImageUrl: null,
          imageUrl: null,
          sectionVisuals: report.visuals.sectionVisuals?.map((visual) => ({
            ...visual,
            imageUrl: null,
            generatedImageUrl: null
          })),
          visuals: report.visuals.visuals?.map((visual) => ({
            ...visual,
            imageUrl: null,
            generatedImageUrl: null
          }))
        }
      : undefined
  };

  await db.collection("mirrorReports").doc(docId).set({
    nickname: payload.nickname || null,
    gender: payload.gender || null,
    brandFocus: payload.brandFocus || null,
    answers: payload.answers,
    report: storedReport,
    source: report.source ?? "demo",
    generatedImageStored: diagnostics.generatedImageStored,
    createdAt: FieldValue.serverTimestamp()
  });

  return docId;
}

export async function getReportFromFirebase(reportId: string) {
  const app = getFirebaseApp();
  if (!app) {
    return null;
  }

  const db = getFirestore(app);
  const doc = await db.collection("mirrorReports").doc(reportId).get();
  if (!doc.exists) {
    return null;
  }

  const data = doc.data() as {
    nickname?: string | null;
    gender?: string | null;
    brandFocus?: string | null;
    answers?: AnalysisPayload["answers"];
    report?: ReportData;
  };

  if (!data.report) {
    return null;
  }

  return {
    ...data.report,
    intake: data.report.intake ?? {
      nickname: data.nickname ?? "",
      gender: data.gender ?? "",
      brandFocus: data.brandFocus ?? "",
      answers: data.answers ?? []
    }
  };
}

export async function listAdminReports(limit = 25) {
  const app = getFirebaseApp();
  if (!app) {
    return [];
  }

  const db = getFirestore(app);
  const snapshot = await db
    .collection("mirrorReports")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      nickname?: string | null;
      gender?: string | null;
      brandFocus?: string | null;
      answers?: AnalysisPayload["answers"];
      createdAt?: { toDate?: () => Date };
      report?: ReportData;
      source?: "demo" | "openai";
      generatedImageStored?: boolean;
    };

    return {
      id: doc.id,
      nickname: data.nickname ?? "",
      gender: data.gender ?? "",
      brandFocus: data.brandFocus ?? "",
      createdAt: data.createdAt?.toDate?.().toISOString() ?? data.report?.createdAt ?? "",
      persona: data.report?.profile.persona ?? "",
      summary: data.report?.profile.summary ?? "",
      keywords: data.report?.profile.keywords ?? [],
      source: data.source ?? data.report?.source ?? "demo",
      storedImage: Boolean(data.generatedImageStored),
      answersCount: data.answers?.length ?? 0
    };
  });
}

export async function listRecentReports(limit = 6): Promise<HistoryItem[]> {
  const app = getFirebaseApp();
  if (!app) {
    return [];
  }

  const db = getFirestore(app);
  const snapshot = await db
    .collection("mirrorReports")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snapshot.docs.map((doc) => {
    const data = doc.data() as {
      createdAt?: { toDate?: () => Date };
      report?: ReportData;
      source?: "demo" | "openai";
    };

    return {
      id: doc.id,
      createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date().toISOString(),
      persona: data.report?.profile.persona ?? "Unknown Persona",
      summary: data.report?.profile.summary ?? "",
      keywords: data.report?.profile.keywords ?? [],
      source: data.source ?? "demo"
    };
  });
}
