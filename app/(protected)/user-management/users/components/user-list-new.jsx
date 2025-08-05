'use client';

import { useMemo, useState } from 'react';
import { redirect } from 'next/navigation';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronRight, Plus, Search, X } from 'lucide-react';
import { formatDate, formatDateTime, getInitials } from '@/lib/helpers';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge, BadgeDot } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useUsers, useRoles } from '@/lib/queries';
import { getUserStatusProps, UserStatusProps } from '../constants/status';
import UserInviteDialog from './user-add-dialog';

const UserList = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Role select query
  const { data: roleList } = useRoles();

  // Users query with filters
  const filters = {
    pageIndex: pagination.pageIndex,
    pageSize: pagination.pageSize,
    sorting,
    searchQuery,
    selectedRole: selectedRole || 'all',
    selectedStatus,
  };

  const { data, isLoading } = useUsers(filters);

  const handleRoleSelection = (roleId) => {
    setSelectedRole(roleId);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleStatusSelection = (status) => {
    setSelectedStatus(status);
    setPagination({ ...pagination, pageIndex: 0 });
  };

  const handleRowClick = (row) => {
    const userId = row.id;
    redirect(`/user-management/users/${userId}`);
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="User"
            visibility={true}
            column={column}
          />
        ),

        cell: ({ row }) => {
          const user = row.original;
          const avatarUrl = user.avatar || null;
          const initials = getInitials(user.name || user.email);

          return (
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                {avatarUrl && (
                  <AvatarImage src={avatarUrl} alt={user.name || ''} />
                )}
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
              <div className="space-y-px">
                <div className="font-medium text-sm">{user.name}</div>
                <div className="text-muted-foreground text-xs">
                  {user.email}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'role',
        id: 'role',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Role"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="text-sm">
              {user.role?.name || 'No role assigned'}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        id: 'status',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Status"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          const statusProps = getUserStatusProps(user.status);

          return (
            <div className="flex items-center gap-2">
              <BadgeDot
                variant={statusProps.variant}
                className="size-2"
              />
              <span className="text-sm">{statusProps.label}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        id: 'createdAt',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Joined"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="text-sm">
              {formatDate(user.createdAt)}
            </div>
          );
        },
      },
      {
        accessorKey: 'lastSignIn',
        id: 'lastSignIn',
        header: ({ column }) => (
          <DataGridColumnHeader
            title="Last Sign In"
            visibility={true}
            column={column}
          />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="text-sm">
              {user.lastSignIn ? formatDateTime(user.lastSignIn) : 'Never'}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => {
          return (
            <div className="flex items-center justify-end">
              <Button
                variant="ghost"
                mode="icon"
                size="sm"
                onClick={() => handleRowClick(row)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [handleRowClick],
  );

  const table = useReactTable({
    data: data?.data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    state: {
      pagination,
      sorting,
    },
    manualPagination: true,
    manualSorting: true,
    pageCount: data?.pagination?.totalPages || 0,
  });

  const DataGridToolbar = () => {
    const handleSearch = () => {
      setPagination({ ...pagination, pageIndex: 0 });
    };

    return (
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <Search className="absolute start-2 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch();
                }
              }}
              className="ps-8"
              disabled={isLoading}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                mode="icon"
                size="sm"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </Button>
            )}
          </div>
          <Select
            onValueChange={handleRoleSelection}
            value={selectedRole || 'all'}
            defaultValue="all"
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All roles</SelectItem>
              {roleList?.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            onValueChange={handleStatusSelection}
            value={selectedStatus || 'all'}
            defaultValue="all"
            disabled={isLoading}
          >
            <SelectTrigger className="w-full sm:w-36">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All users</SelectItem>
              {Object.entries(UserStatusProps).map(([status, { label }]) => (
                <SelectItem key={status} value={status}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center justify-end">
          <Button
            disabled={isLoading && true}
            onClick={() => {
              setInviteDialogOpen(true);
            }}
          >
            <Plus />
            Add user
          </Button>
        </div>
      </CardHeader>
    );
  };

  return (
    <>
      <DataGrid
        table={table}
        recordCount={data?.pagination.total || 0}
        isLoading={isLoading}
        onRowClick={handleRowClick}
        tableLayout={{
          columnsResizable: true,
          columnsPinnable: true,
          columnsMovable: true,
          columnsVisibility: true,
        }}
        tableClassNames={{
          edgeCell: 'px-5',
        }}
      >
        <Card>
          <DataGridToolbar />
          <CardTable>
            <ScrollArea>
              <DataGridTable />
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </CardTable>
          <CardFooter>
            <DataGridPagination />
          </CardFooter>
        </Card>
      </DataGrid>

      <UserInviteDialog
        open={inviteDialogOpen}
        closeDialog={() => setInviteDialogOpen(false)}
      />
    </>
  );
};

export default UserList; 