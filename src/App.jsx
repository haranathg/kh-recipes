import { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { hasPasskey } from './api';
import { useRecipes } from './hooks/useRecipes';
import PasskeyGate from './components/PasskeyGate';
import RecipeLibrary from './components/RecipeLibrary';
import AddRecipe from './components/AddRecipe';
import RecipeView from './components/RecipeView';
import RecipeEdit from './components/RecipeEdit';

export default function App() {
  const [authenticated, setAuthenticated] = useState(hasPasskey());
  const recipeState = useRecipes();

  // Re-check auth if passkey changes
  useEffect(() => {
    setAuthenticated(hasPasskey());
  }, []);

  const handleAuth = () => {
    setAuthenticated(true);
    recipeState.loadRecipes();
  };

  const handleLogout = () => {
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <PasskeyGate onSuccess={handleAuth} />;
  }

  return (
    <div className="min-h-screen safe-area-top safe-area-bottom">
      <Routes>
        <Route 
          path="/" 
          element={
            <RecipeLibrary 
              {...recipeState}
              onLogout={handleLogout}
            />
          } 
        />
        <Route 
          path="/add" 
          element={
            <AddRecipe 
              onSave={recipeState.addRecipe}
            />
          } 
        />
        <Route 
          path="/recipe/:id" 
          element={
            <RecipeView 
              getRecipe={recipeState.getRecipe}
              onDelete={recipeState.deleteRecipe}
            />
          } 
        />
        <Route 
          path="/recipe/:id/edit" 
          element={
            <RecipeEdit 
              getRecipe={recipeState.getRecipe}
              onSave={recipeState.updateRecipe}
            />
          } 
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
