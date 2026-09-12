-- CreateTable
CREATE TABLE "curated_lists" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "curated_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "curated_list_places" (
    "curatedListId" TEXT NOT NULL,
    "placeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "curated_list_places_pkey" PRIMARY KEY ("curatedListId","placeId")
);

-- CreateIndex
CREATE UNIQUE INDEX "curated_lists_slug_key" ON "curated_lists"("slug");

-- AddForeignKey
ALTER TABLE "curated_list_places" ADD CONSTRAINT "curated_list_places_curatedListId_fkey" FOREIGN KEY ("curatedListId") REFERENCES "curated_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "curated_list_places" ADD CONSTRAINT "curated_list_places_placeId_fkey" FOREIGN KEY ("placeId") REFERENCES "places"("id") ON DELETE CASCADE ON UPDATE CASCADE;
