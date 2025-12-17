import { getSession } from "@/lib/auth";
import { verifyMobileToken } from "@/lib/mobile-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { bilanStructure } from "@/data/analyses/analyses-data";
import { analyseServerAnalytics } from "@/lib/server-analytics";

// Helper function to get userId from session or JWT token
async function getUserId(request: NextRequest): Promise<number | null> {
  // Try mobile JWT authentication first
  const mobileUserId = verifyMobileToken(request);
  if (mobileUserId) {
    return mobileUserId;
  }

  // Fall back to session-based authentication (web)
  const session = await getSession();
  if (session?.user) {
    return parseInt((session.user as any).id);
  }

  return null;
}

export async function GET(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userIdNum = userId;

    // Get analyses created by this user
    const analyses = await prisma.analyse.findMany({
      where: {
        creatorId: userIdNum,
      },
      include: {
        Patient: {
          select: {
            id: true,
            fullName: true,
            dateOfBirth: true,
          },
        },
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        LabEntry: {
          select:{
            id:true,
            name:true,
            value:true,
            interpretation:true,
          }
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      data: analyses,
    });
  } catch (error) {
    console.error("Error fetching analyses:", error);
    return NextResponse.json(
      { error: "Failed to fetch analyses" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId(req);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userIdNum = userId;

    const data = await req.json();
    const {
      category,
      title,
      patientId,
      patientName,
      patientAge,
      patientHistory,
      details,
      comment,
      selectedBilans,
      customBilans,
    } = data;


    console.log('ANALYSE DATA @@@@@@@@@@@@@@@@')
    console.log(data)

    if (!title && !selectedBilans) {
      return NextResponse.json(
        { error: "Title or bilans are required" },
        { status: 400 }
      );
    }

    let finalTitle = title;
    let categoriesForTitle: string[] = [];
    let allLabItems: string[] = [];

    if (selectedBilans && selectedBilans.length > 0) {
      // For bilans, map items back to category labels
      // Find which categories contain the selected items
      const selectedSet = new Set(selectedBilans);

      bilanStructure.categories.forEach((cat) => {
        // Check if any items from this category are selected
        const hasSelectedItems = cat.items.some((item) => selectedSet.has(item));
        if (hasSelectedItems) {
          categoriesForTitle.push(cat.label);
          // Collect all items from selected categories
          cat.items.forEach((item) => {
            if (selectedSet.has(item)) {
              allLabItems.push(item);
            }
          });
        }
      });

      // Add custom bilans to the list
      if (customBilans?.trim()) {
        const customItems = customBilans
          .split(",")
          .map((item: string) => item.trim())
          .filter((item: string) => item.length > 0);
        allLabItems.push(...customItems);
      }

      // Set title as comma-separated category labels
      finalTitle = categoriesForTitle.join(", ");
      console.log('FINALE title')
      console.log(finalTitle)
    }

    // Create analyse
    const analyseData: any = {
      category: category || "bilan",
      title: finalTitle,
      details: details || comment || undefined,
      status: "En cours",
      patientName: patientName || undefined,
      patientAge: patientAge ? String(patientAge) : undefined,
      patientHistory: patientHistory || undefined,
      creatorId: userIdNum, // Set creator to current user
      updatedAt: new Date(),
    };

    if (patientId) {
      analyseData.patientId = patientId;
    }

    const analyse = await prisma.analyse.create({
      data: analyseData,
      include: {
        Patient: {
          select: {
            id: true,
            fullName: true,
          },
        },
        User: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        LabEntry: true,
      },
    });

    // Track analyse creation event
    await analyseServerAnalytics.trackAnalyseCreated({
      id: analyse.id,
      title: analyse.title!,
      category: analyse.category!,
      creatorId: analyse.creatorId,
      patientId: analyse.patientId ?? undefined,
      patientName: analyse.patientName ?? undefined,
    });

    // If type is bilan, create LabEntry records for each selected item
    if (category === "bilan" && allLabItems.length > 0) {
      const labEntries = await Promise.all(
        allLabItems.map((itemName) =>
          prisma.labEntry.create({
            data: {
              name: itemName,
              value: null,
              interpretation: null,
              updatedAt: new Date(),
              Analyse: {
                connect:{
                  id:analyse.id,
                }
              },
            },
          })
        )
      );

      // Add lab entries to the response
      analyse.LabEntry = labEntries;
    }

    return NextResponse.json({
      data: analyse,
      message: "Analyse créée avec succès",
    });
  } catch (error) {
    console.error("Error creating Analyse:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to create analyse",
      },
      { status: 500 }
    );
  }
}
