import { useCallback, useEffect, useState } from 'react';

import Header from '../../components/Header';
import api from '../../services/api';
import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';
import { FoodsContainer } from './styles';

interface IFood {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  image: string;
}

interface FoodProps {
  image: string;
  name: string;
  price: string;
  description: string;
}

export default function Dashboard() {
  const [foods, setFoods] = useState<IFood[]>([]);
  const [editingFood, setEditingFood] = useState<IFood>({} as IFood);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function getFoods() {
      const response = await api.get('/foods');

      setFoods(response.data);
    }

    getFoods();
  }, []);

  const handleAddFood = useCallback(
    async (food: FoodProps): Promise<void> => {
      try {
        const response = await api.post('/foods', {
          ...food,
          available: true,
        });

        setFoods([...foods, response.data]);
      } catch (err) {
        console.log(err);
      }
    }, [foods]
  );

  const handleUpdateFood = useCallback(
    async (food: FoodProps): Promise<void> => {
      try {
        const foodUpdated = await api.put(
          `/foods/${editingFood.id}`,
          { ...editingFood, ...food },
        );

        const foodsUpdated = foods.map(f =>
          f.id !== foodUpdated.data.id ? f : foodUpdated.data,
        );

        setFoods(foodsUpdated);
      } catch (err) {
        console.log(err);
      }
    }, [editingFood, foods]
  );

  const handleDeleteFood = useCallback(
    async (id: number): Promise<void> => {
      await api.delete(`/foods/${id}`);

      const foodsFiltered = foods.filter(food => food.id !== id);

      setFoods(foodsFiltered);
    }, [foods]
  );

  const toggleModal = useCallback(
    async (): Promise<void> => {
      setModalOpen(!modalOpen);
    }, [modalOpen]
  );

  const toggleEditModal = useCallback(
    async (): Promise<void> => {
      setEditModalOpen(!modalOpen);
    }, [modalOpen]
  );

  const handleEditFood = useCallback(
    async (food: IFood): Promise<void> => {
      setEditModalOpen(true);
      setEditingFood(food);
    }, []
  );

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
            />
          ))}
      </FoodsContainer>
    </>
  );
};
