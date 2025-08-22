'use client';

import { useMemo, useState } from 'react';
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Clock } from 'lucide-react';
import { Card, CardTable } from '@/components/ui/card';
import { DataGrid } from '@/components/ui/data-grid';
import { DataGridColumnHeader } from '@/components/ui/data-grid-column-header';
import {
  DataGridTable,
  DataGridTableRowSelect,
  DataGridTableRowSelectAll,
} from '@/components/ui/data-grid-table';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

const data = [
  {
    id: '1',
    name: 'Ritesh Adhikari',
    email: 'ritesh87@outlook.com',
    status: 'Pending',
    invitation: 'not sent',
    notes: '',
  },
  {
    id: '2',
    name: 'Ajay Devkar',
    email: 'ajay@jspinfotech.com',
    status: 'Sent',
    invitation: 'not sent',
    notes: '',
  },
  {
    id: '3',
    name: 'Dhruvi Sangani',
    email: 'dhruvi@jspinfotech.com',
    status: 'Sent',
    invitation: ' sent',
    notes: '',
  },
];

const GuestListTable = () => {
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [sorting, setSorting] = useState([{ id: 'name', desc: false }]);
  const [rowSelection, setRowSelection] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      // Filter by search query (case-insensitive)
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        !searchQuery ||
        item.team.name.toLowerCase().includes(searchLower) ||
        item.team.description.toLowerCase().includes(searchLower);

      return matchesSearch;
    });
  }, [searchQuery]);

  const columns = useMemo(() => [
    {
      accessorKey: 'id',
      accessorFn: (row) => row.id,
      header: () => <DataGridTableRowSelectAll />,
      cell: ({ row }) => <DataGridTableRowSelect row={row} />,
      enableSorting: false,
      enableHiding: false,
      enableResizing: false,
      size: 51,
      meta: {
        cellClassName: '',
      },
    },
    {
      id: 'name',
      accessorFn: (row) => row.name,
      header: ({ column }) => (
        <DataGridColumnHeader title="Guest" column={column} />
      ),

      cell: ({ row }) => (
        <div className="flex flex-col gap-2">
          <span className="leading-none font-medium text-sm text-mono">
            {row.original.name}
          </span>
          <span className="text-xs text-secondary-foreground font-normal leading-3">
            {row.original.email}
          </span>
        </div>
      ),

      enableSorting: true,
      size: 360,
      meta: {
        cellClassName: '',
      },
    },
    {
      id: 'status',
      accessorFn: (row) => row.status,
      header: ({ column }) => (
        <DataGridColumnHeader title="RSVP" column={column} />
      ),

      cell: ({ row }) => (
        <div className="flex gap-2 items-center">
          <Clock className="size-4" />
          <span className="leading-none font-medium text-sm text-mono">
            {row.original.status}
          </span>
        </div>
      ),

      enableSorting: true,
      size: 200,
      meta: {
        cellClassName: '',
      },
    },
    {
      id: 'invitation',
      accessorFn: (row) => row.invitation,
      header: ({ column }) => (
        <DataGridColumnHeader title="Invitation" column={column} />
      ),

      cell: ({ row }) => (
        <span className="text-secondary-foreground font-normal">
          {row.original.invitation}
        </span>
      ),

      enableSorting: true,
      size: 200,
      meta: {
        cellClassName: '',
      },
    },
    {
      id: 'notes',
      accessorFn: (row) => row.notes,
      header: ({ column }) => (
        <DataGridColumnHeader title="Notes" column={column} />
      ),

      cell: ({ row }) => (
        <span className="text-secondary-foreground font-normal">
          {row.original.notes}
        </span>
      ),

      enableSorting: true,
      size: 200,
      meta: {
        cellClassName: '',
      },
    },
  ]);

  const table = useReactTable({
    columns,
    data: filteredData,
    pageCount: Math.ceil((filteredData?.length || 0) / pagination.pageSize),
    getRowId: (row) => String(row.id),
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    columnResizeMode: 'onChange',
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <DataGrid
      table={table}
      recordCount={filteredData?.length || 0}
      tableLayout={{
        columnsPinnable: true,
        columnsMovable: true,
        columnsVisibility: true,
        cellBorder: false,
      }}
    >
      <Card>
        <CardTable>
          <ScrollArea>
            <DataGridTable />
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardTable>
      </Card>
    </DataGrid>
  );
};

export { GuestListTable };
