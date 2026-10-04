-- CreateTable
CREATE TABLE IF NOT EXISTS "OrderSequence" (
    "year" INTEGER NOT NULL,
    "lastSeq" INTEGER NOT NULL,

    CONSTRAINT "OrderSequence_pkey" PRIMARY KEY ("year")
);
