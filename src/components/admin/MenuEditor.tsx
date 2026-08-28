"use client";

import { useState } from "react";
import type { MenuItem, Category, Collection, Product, Page } from "@prisma/client";
import { deleteMenuItem, moveMenuItem } from "@/actions/admin/navigation";
import { MenuItemForm } from "./MenuItemForm";
import { ReorderButtons } from "./ReorderButtons";
import { DeleteButton } from "./DeleteButton";

type ItemWithChildren = MenuItem & { children: MenuItem[] };

export function MenuEditor({
  menuId,
  items,
  categories,
  collections,
  products,
  pages,
}: {
  menuId: string;
  items: ItemWithChildren[];
  categories: Category[];
  collections: Collection[];
  products: Product[];
  pages: Page[];
}) {
  const [addingTop, setAddingTop] = useState(false);

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <MenuItemRow
          key={item.id}
          menuId={menuId}
          item={item}
          isFirst={i === 0}
          isLast={i === items.length - 1}
          categories={categories}
          collections={collections}
          products={products}
          pages={pages}
        />
      ))}

      {addingTop ? (
        <MenuItemForm
          menuId={menuId}
          categories={categories}
          collections={collections}
          products={products}
          pages={pages}
          onDone={() => setAddingTop(false)}
        />
      ) : (
        <button onClick={() => setAddingTop(true)} className="btn-outline">
          Add Menu Item
        </button>
      )}
    </div>
  );
}

function MenuItemRow({
  menuId,
  item,
  isFirst,
  isLast,
  categories,
  collections,
  products,
  pages,
}: {
  menuId: string;
  item: ItemWithChildren;
  isFirst: boolean;
  isLast: boolean;
  categories: Category[];
  collections: Collection[];
  products: Product[];
  pages: Page[];
}) {
  const [editing, setEditing] = useState(false);
  const [addingChild, setAddingChild] = useState(false);

  return (
    <div className="border border-stone bg-ivory p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ReorderButtons
            onMoveUp={moveMenuItem.bind(null, item.id, "up")}
            onMoveDown={moveMenuItem.bind(null, item.id, "down")}
            disableUp={isFirst}
            disableDown={isLast}
          />
          <span className="font-medium">{item.label}</span>
          <span className="text-xs text-noir/50">{item.type}</span>
        </div>
        <div className="flex gap-3 text-xs uppercase tracking-wide">
          <button onClick={() => setAddingChild((v) => !v)} className="underline">
            + Submenu
          </button>
          <button onClick={() => setEditing((v) => !v)} className="underline">
            Edit
          </button>
          <DeleteButton action={deleteMenuItem.bind(null, item.id)} />
        </div>
      </div>

      {editing ? (
        <div className="mt-3">
          <MenuItemForm
            menuId={menuId}
            item={item}
            categories={categories}
            collections={collections}
            products={products}
            pages={pages}
            onDone={() => setEditing(false)}
          />
        </div>
      ) : null}

      {item.children.length > 0 ? (
        <div className="mt-3 space-y-2 border-l border-stone pl-4">
          {item.children.map((child) => (
            <div key={child.id} className="flex items-center justify-between text-sm">
              <span>{child.label}</span>
              <DeleteButton action={deleteMenuItem.bind(null, child.id)} />
            </div>
          ))}
        </div>
      ) : null}

      {addingChild ? (
        <div className="mt-3">
          <MenuItemForm
            menuId={menuId}
            parentId={item.id}
            categories={categories}
            collections={collections}
            products={products}
            pages={pages}
            onDone={() => setAddingChild(false)}
          />
        </div>
      ) : null}
    </div>
  );
}
