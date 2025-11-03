export interface IQuizFilter {
  topic?: string;                  
  level?: "Easy" | "Medium" | "Hard"; 
  limit?: number;                  
  skip?: number;                   
  sortBy?: string;                 
  sortOrder?: "asc" | "desc";      
}