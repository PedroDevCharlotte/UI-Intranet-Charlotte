import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';

// types
import { UserList, UserProps } from 'types/user';

const initialState: UserProps = {
  modal: false
};

// ==============================|| API - USER ||============================== //

const endpoints = {
  key: 'api/user',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetUser() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      users: data?.users as UserList[] || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.users?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function insertUser(newUser: UserList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      newUser.id = currentUser.users.length + 1;
      const addedUser: UserList[] = [...currentUser.users, newUser];

      return {
        ...currentUser,
        users: addedUser
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { newUser };
  //   await axios.post(endpoints.key + endpoints.insert, data);
}

export async function updateUser(userId: number, updatedUser: UserList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      const newUser: UserList[] = currentUser.users.map((user: UserList) =>
        user.id === userId ? { ...user, ...updatedUser } : user
      );

      return {
        ...currentUser,
        users: newUser
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { list: updatedUser };
  //   await axios.post(endpoints.key + endpoints.update, data);
}

export async function deleteUser(userId: number) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      const nonDeletedUser = currentUser.users.filter((user: UserList) => user.id !== userId);

      return {
        ...currentUser,
        users: nonDeletedUser
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { userId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
}

export function useGetUserMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      userMaster: data,
      userMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerUserDialog(modal: boolean) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentUserMaster: any) => {
      return { ...currentUserMaster, modal };
    },
    false
  );
}
