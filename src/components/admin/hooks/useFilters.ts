import { useState, useCallback } from 'react';
import { FilterState } from '../types';

interface User {
  role?: string;
  status?: string;
}

interface Post {
  type?: string;
}

export const useFilters = () => {
  const [userFilters, setUserFilters] = useState<FilterState>({
    role: '',
    status: '',
  });
  const [postFilters, setPostFilters] = useState<FilterState>({
    type: '',
  });
  const [redeemStatusFilter, setRedeemStatusFilter] = useState('');

  const filterUsers = useCallback(
    (users: User[]) => {
      return users.filter(user => {
        const matchesRole = !userFilters.role || user.role === userFilters.role;
        const matchesStatus =
          !userFilters.status || user.status === userFilters.status;
        return matchesRole && matchesStatus;
      });
    },
    [userFilters]
  );

  const filterPosts = useCallback(
    (posts: Post[]) => {
      return posts.filter(post => {
        const matchesType = !postFilters.type || post.type === postFilters.type;
        return matchesType;
      });
    },
    [postFilters]
  );

  return {
    userFilters,
    setUserFilters,
    postFilters,
    setPostFilters,
    redeemStatusFilter,
    setRedeemStatusFilter,
    filterUsers,
    filterPosts,
  };
};
