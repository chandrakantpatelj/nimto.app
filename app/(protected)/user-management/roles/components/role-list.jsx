'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import {
  Ellipsis,
  Plus,
  Search,
  ShieldAlert,
  UserRound,
  X,
  Edit,
  Trash2,
} from 'lucide-react';
import { apiFetch } from '@/lib/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardFooter, CardHeader, CardTable } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import { DataGridPagination } from '@/components/ui/data-grid-pagination';
import { DataGridTable } from '@/components/ui/data-grid-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import RoleDefaultDialog from './role-default-dialog';
import RoleDeleteDialog from './role-delete-dialog';
import RoleEditDialog from './role-edit-dialog';

const RoleList = () => {
  // List state management
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([{ id: 'createdAt', desc: true }]);

  // Form state management
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [defaultDialogOpen, setDefaultDialogOpen] = useState(false);

  const [editRole, setEditRole] = useState(null);
  const [deleteRole, setDeleteRole] = useState(null);
  const [defaultRole, setDefaultRole] = useState(null);

  // Query state management
  const [searchQuery, setSearchQuery] = useState('');

  // Role list
  const { data, isLoading } = useQuery({
    queryKey: ['user-roles', pagination, sorting, searchQuery],
    queryFn: () =>
      fetchRoles({
        pageIndex: pagination.pageIndex,
        pageSize: pagination.pageSize,
        sorting,
        searchQuery,
      }),
    staleTime: Infinity,
    gcTime: 1000 * 60 * 60, // 60 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
  });

  // Fetch roles from the server API
  const fetchRoles = async ({
    pageIndex,
    pageSize,
    sorting,
    filters,
    searchQuery,
  }) => {
    const sortField = sorting?.[0]?.id || '';
    const sortDirection = sorting?.[0]?.desc ? 'desc' : 'asc';

    const params = new URLSearchParams({
      page: String(pageIndex + 1),
      limit: String(pageSize),
      ...(sortField ? { sort: sortField, dir: sortDirection } : {}),
      ...(searchQuery ? { query: searchQuery } : {}),
      ...Object.fromEntries(
        (filters || []).map((f) => [f.id, String(f.value)]),
      ),
    });

    const response = await apiFetch(
      `/api/user-management/roles?${params.toString()}`,
    );

    if (!response.ok) {
      throw new Error(
        'Oops! Something didn\'t go as planned. Please try again in a moment.',
      );
    }

    return response.json();
  };

  // Table settings
  const columns = useMemo(
    () => [
      {
        accessorKey: 'name',
        id: 'name',
        header: ({ column }) => (
          <DataGridColumnHeader title="NAME" column={column} visibility />
        ),
        cell: ({ row, getValue }) => {
          const value = getValue();
          const isProtected = row.original.isProtected;
          const isDefault = row.original.isDefault;

          return (
            <div className="flex items-center flex-wrap gap-2">
              <span className="font-medium">{value}</span>
              {isProtected && (
                <Badge variant="outline" className="text-xs">
                  <ShieldAlert className="text-destructive mr-1 h-3 w-3" />
                  System Core
                </Badge>
              )}
            </div>
          );
        },
        size: 200,
        enableSorting: true,
        enableHiding: false,
        meta: {
          headerTitle: 'NAME',
          skeleton: <Skeleton className="w-28 h-7" />,
        },
      },
      {
        accessorKey: 'description',
        id: 'description',
        header: ({ column }) => (
          <DataGridColumnHeader title="DESCRIPTION" column={column} visibility />
        ),
        cell: (info) => {
          const value = info.getValue();
          return (
            <div className="text-sm text-muted-foreground">
              {value || '-'}
            </div>
          );
        },
        size: 300,
        enableSorting: true,
        enableHiding: true,
        meta: {
          headerTitle: 'DESCRIPTION',
          skeleton: <Skeleton className="w-44 h-7" />,
        },
      },
      {
        accessorKey: 'permissions',
        id: 'permissions',
        header: 'PERMISSIONS',
        cell: (info) => {
          const permissions = info.getValue();

          if (!permissions || permissions.length === 0) {
            return <span className="text-muted-foreground">-</span>;
          }

          const displayedPermissions = permissions.slice(0, 5);
          const extraPermissionsCount =
            permissions.length - displayedPermissions.length;

          return (
            <div className="flex items-center gap-1 flex-wrap">
              {displayedPermissions.map((permission, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {permission.slug}
                </Badge>
              ))}
              {extraPermissionsCount > 0 && (
                <span className="text-muted-foreground text-xs ms-1">{`+${extraPermissionsCount} more`}</span>
              )}
            </div>
          );
        },
        minSize: 400,
        enableSorting: false,
        enableHiding: true,
        meta: {
          headerTitle: 'PERMISSIONS',
          skeleton: <Skeleton className="w-44 h-7" />,
        },
      },
      {
        id: 'actions',
        header: 'ACTIONS',
        cell: ({ row }) => {
          const isProtected = row.original.isProtected;
          
          return (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setEditRole(row.original);
                  setEditDialogOpen(true);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              {!isProtected && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setDeleteRole(row.original);
                    setDeleteDialogOpen(true);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
        size: 100,
        enableSorting: false,
        enableResizing: false,
        meta: {
          skeleton: <Skeleton className="size-5" />,
        },
      },
    ],
    [],
  );

  const table = useReactTable({
    columns,
    data: data?.data || [],
    pageCount: Math.ceil((data?.pagination.total || 0) / pagination.pageSize),
    getRowId: (row) => row.id,
    state: {
      pagination,
      sorting,
    },
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
  });

  const DataGridToolbar = () => {
    const [inputValue, setInputValue] = useState(searchQuery);

    const handleSearch = () => {
      setSearchQuery(inputValue);
      setPagination({ ...pagination, pageIndex: 0 });
    };

    return (
      <CardHeader className="py-5">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="size-4 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2" />
            <Input
              placeholder="Search roles"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              disabled={isLoading}
              className="ps-9 w-full md:w-64"
            />

            {searchQuery.length > 0 && (
              <Button
                mode="icon"
                variant="dim"
                className="absolute end-1.5 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => setSearchQuery('')}
              >
                <X />
              </Button>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            disabled={isLoading && true}
            onClick={() => {
              setEditRole(null);
              setEditDialogOpen(true);
            }}
          >
            <Plus />
            Add Role
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
        tableLayout={{
          columnsResizable: true,
          columnsPinnable: true,
          columnsMovable: true,
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

      <RoleEditDialog
        open={editDialogOpen}
        closeDialog={() => setEditDialogOpen(false)}
        role={editRole}
      />

      {deleteRole && (
        <RoleDeleteDialog
          open={deleteDialogOpen}
          closeDialog={() => setDeleteDialogOpen(false)}
          role={deleteRole}
        />
      )}

      {defaultRole && (
        <RoleDefaultDialog
          open={defaultDialogOpen}
          closeDialog={() => setDefaultDialogOpen(false)}
          role={defaultRole}
        />
      )}
    </>
  );
};

export default RoleList;
