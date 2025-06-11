import {z} from "zod"

export const journalSchema = z.object({
    title: z.string().min(1, "Title is required"),
    content: z
  .string()
  .refine(
    (val) => val.replace(/<(.|\n)*?>/g, "").trim().length > 0,
    "Content is required"
  ),


//   👆 Ye Zod ko bol raha hai:

// HTML tags hata do

// Agar sirf <p><br></p> jaisa kuch ho, to usay bhi empty samjho


    mood: z.string().min(1, "Mood is required"),
    collectionId: z.string().optional(),
  });


  export const collectionSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),

  })