
import { useState, useEffect } from "react";
import { defaultPosters, Poster } from "@/data/posters";

export const usePosterData = () => {
  const [posters, setPosters] = useState<Poster[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const loadPosters = () => {
    // Check if user is admin
    const userRole = localStorage.getItem("userRole");
    setIsAdmin(userRole === "admin");
    
    try {
      // Get posters from localStorage or use default posters
      const storedPosters = localStorage.getItem("posters");
      
      if (storedPosters) {
        try {
          const parsedPosters = JSON.parse(storedPosters);
          
          // Make sure all posters have valid image URLs
          const validatedPosters = parsedPosters.map((poster: Poster) => {
            if (!poster.image || 
                (poster.image.includes(":\\") || 
                 (poster.image.includes("/") && 
                  !poster.image.startsWith("http") && 
                  !poster.image.startsWith("/lovable-uploads") &&
                  !poster.image.startsWith("/")))) {
              return {
                ...poster,
                image: "/placeholder.svg" 
              };
            }
            return poster;
          });
          
          setPosters(validatedPosters);
          console.log("Loaded posters:", validatedPosters);
        } catch (error) {
          console.error("Error parsing posters from localStorage:", error);
          // If parsing fails, reset with default posters
          localStorage.setItem("posters", JSON.stringify(defaultPosters));
          setPosters(defaultPosters);
        }
      } else {
        // If no posters in localStorage, save default posters
        localStorage.setItem("posters", JSON.stringify(defaultPosters));
        setPosters(defaultPosters);
      }
    } catch (error) {
      console.error("Error loading posters:", error);
      setPosters(defaultPosters);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadPosters();
  }, []);

  // Extract unique categories from posters
  const allCategories = Array.from(new Set(posters.map(poster => poster.category)));
  
  // Get custom categories from localStorage
  let customCategories: string[] = [];
  try {
    customCategories = JSON.parse(localStorage.getItem("customCategories") || "[]");
  } catch (error) {
    console.error("Error parsing custom categories:", error);
    localStorage.setItem("customCategories", JSON.stringify([]));
  }
  
  // Merge default and custom categories
  const categories = Array.from(new Set([...allCategories, ...customCategories]));
  
  // Get subcategories for movies
  const movieSubcategories = Array.from(
    new Set(
      posters
        .filter(poster => poster.category === "movies" && poster.subcategory)
        .map(poster => poster.subcategory)
    )
  );

  // Function to update posters in state and localStorage
  const updatePosters = (newPosters: Poster[]) => {
    setPosters(newPosters);
    localStorage.setItem("posters", JSON.stringify(newPosters));
  };

  return { 
    posters, 
    isAdmin, 
    isLoading, 
    categories,
    movieSubcategories,
    setPosters: updatePosters,
    refreshPosters: loadPosters
  };
};
