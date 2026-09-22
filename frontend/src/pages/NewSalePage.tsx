import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import type {
  BoletaDocumentMode,
  Customer,
  Product,
  ReceiptType,
} from "../types";

type CartItem = {
  product: Product;
  quantity: number;
};

export function NewSalePage() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const [by, setBy] = useState<"any" | "name" | "code">("any");
  const [results, setResults] = useState<Product[]>([]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [editingQty, setEditingQty] = useState<Record<string, string>>({});

  const [receiptType, setReceiptType] =
    useState<ReceiptType>("BOLETA");

  const [boletaMode, setBoletaMode] =
    useState<BoletaDocumentMode>("NONE");

  const [customerQuery, setCustomerQuery] = useState("");
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);

  const [documentNumber, setDocumentNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [ruc, setRuc] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const total = useMemo(
    () =>
      cart.reduce(
        (acc, item) =>
          acc + item.product.price * item.quantity,
        0,
      ),
    [cart],
  );


  async function searchProducts() {
    const search = term.trim();

    if (!search) {
      setResults([]);
      return;
    }

    setError("");

    try {
      const data = await api<Product[]>(
        `/api/products/search?q=${encodeURIComponent(search)}&by=${by}`,
      );

      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron buscar los productos",
      );
    }
  }

  useEffect(() => {
    const search = term.trim();

    if (!search) {
      setResults([]);
      return;
    }

    const timer = window.setTimeout(() => {
      searchProducts();
    }, 300);

    return () => window.clearTimeout(timer);
  }, [term, by]);


  function addProduct(product: Product) {
    if (product.stock <= 0) {
      setError(
        `"${product.name}" no tiene stock disponible.`,
      );
      return;
    }

    setError("");

    setCart((current) => {
      const existing = current.find(
        (item) => item.product.id === product.id,
      );

      if (existing) {
        if (existing.quantity >= product.stock) {
          setError(
            `No hay más stock disponible de "${product.name}".`,
          );

          return current;
        }

        return current.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item,
        );
      }

      return [
        ...current,
        {
          product,
          quantity: 1,
        },
      ];
    });
  }

  function setQty(id: string, quantity: number) {
    if (!Number.isFinite(quantity) || quantity < 1) {
      return;
    }

    setCart((current) =>
      current.map((item) =>
        item.product.id === id
          ? {
              ...item,
              quantity: Math.min(
                quantity,
                item.product.stock,
              ),
            }
          : item,
      ),
    );
  }

  function removeFromCart(id: string) {
    setCart((current) =>
      current.filter((item) => item.product.id !== id),
    );

    setEditingQty((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  }

  async function searchCustomers(event: FormEvent) {
    event.preventDefault();

    const search = customerQuery.trim();

    if (!search) {
      setCustomers([]);
      return;
    }

    try {
      const data = await api<Customer[]>(
        `/api/customers/search?q=${encodeURIComponent(search)}`,
      );

      setCustomers(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron buscar los clientes",
      );
    }
  }

 function selectCustomer(next: Customer) {
    setCustomer(next);

    if (next.documentType === "DNI") {
      setReceiptType("BOLETA");
      setBoletaMode("DNI");

      setDocumentNumber(next.documentNumber);
      setCustomerName(next.name);
    } else {
      setReceiptType("FACTURA");

      setRuc(next.documentNumber);
      setBusinessName(next.name);
    }

    setCustomers([]);
  }

  function changeReceiptType(type: ReceiptType) {
    setReceiptType(type);

    // Al cambiar de comprobante quitamos el cliente seleccionado
    setCustomer(null);

    if (type === "BOLETA") {
      setRuc("");
      setBusinessName("");
    }

    if (type === "FACTURA") {
      setBoletaMode("NONE");
      setDocumentNumber("");
      setCustomerName("");
    }
  }


  function validateSale(): string | null {
    if (cart.length === 0) {
      return "Agrega al menos un producto a la venta.";
    }

    // Validación de stock del carrito
    for (const item of cart) {
      if (item.quantity < 1) {
        return `La cantidad de "${item.product.name}" no es válida.`;
      }

      if (item.quantity > item.product.stock) {
        return `No hay suficiente stock de "${item.product.name}".`;
      }
    }

    if (
      receiptType === "BOLETA" &&
      boletaMode === "DNI"
    ) {
      const dni = documentNumber.trim();
      const name = customerName.trim();

      if (!/^\d{8}$/.test(dni)) {
        return "El DNI debe tener exactamente 8 dígitos.";
      }

      if (!name) {
        return "Ingresa el nombre del cliente.";
      }
    }


    if (receiptType === "FACTURA") {
      const cleanRuc = ruc.trim();
      const cleanBusinessName = businessName.trim();

      if (!/^\d{11}$/.test(cleanRuc)) {
        return "El RUC debe tener exactamente 11 dígitos.";
      }

      if (!cleanBusinessName) {
        return "Ingresa la razón social.";
      }
    }

    return null;
  }

  async function submit(event: FormEvent) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError("");

    const validationError = validateSale();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      await api("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          receiptType,

          boletaDocumentMode:
            receiptType === "BOLETA"
              ? boletaMode
              : undefined,

          customerId:
            customer?.id ?? null,

          documentNumber:
            receiptType === "BOLETA" &&
            boletaMode === "DNI"
              ? documentNumber.trim()
              : null,

          customerName:
            receiptType === "BOLETA" &&
            boletaMode === "DNI"
              ? customerName.trim()
              : null,

          ruc:
            receiptType === "FACTURA"
              ? ruc.trim()
              : null,

          businessName:
            receiptType === "FACTURA"
              ? businessName.trim()
              : null,

          items: cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
        }),
      });

      navigate("/ventas");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "No se pudo registrar la venta",
      );
    } finally {
      setIsSubmitting(false);
    }
  }


  return (
    <form
      onSubmit={submit}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          event.target instanceof HTMLInputElement
        ) {
          event.preventDefault();
        }
      }}
      className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]"
    >
      {/* ======================================================
          COLUMNA IZQUIERDA
      ======================================================= */}

      <section className="space-y-4">
        <h1 className="font-display text-4xl">
          Registrar venta
        </h1>

        {/* ----------------------------------------------------
            BUSCAR PRODUCTO
        ----------------------------------------------------- */}

        <div className="rounded-3xl border border-line bg-card p-5">
          <h2 className="font-display text-2xl">
            Buscar producto
          </h2>

          <p className="text-sm text-ink/60">
            Busca por nombre o código.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <input
              className="min-w-48 flex-1 rounded-full border border-line bg-paper px-4 py-2"
              placeholder="Arroz, ARR001..."
              value={term}
              onChange={(event) =>
                setTerm(event.target.value)
              }
            />

            <select
              className="rounded-full border border-line bg-paper px-3 py-2"
              value={by}
              onChange={(event) =>
                setBy(
                  event.target.value as typeof by,
                )
              }
            >
              <option value="any">
                Nombre o código
              </option>

              <option value="name">
                Nombre
              </option>

              <option value="code">
                Código
              </option>
            </select>

            <button
              type="button"
              onClick={searchProducts}
              className="rounded-full bg-pine px-4 py-2 text-white"
            >
              Buscar
            </button>
          </div>

          {/* Resultados */}
          <ul className="mt-3 divide-y divide-line">
            {results.map((product) => (
              <li
                key={product.id}
                className="flex items-center justify-between gap-3 py-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="font-semibold">
                    {product.name}
                  </p>

                  <p className="text-xs text-ink/50">
                    {product.code} · S/{" "}
                    {Number(product.price).toFixed(2)}
                  </p>

                  <p
                    className={
                      product.stock <= 0
                        ? "text-xs font-semibold text-clay"
                        : "text-xs text-ink/50"
                    }
                  >
                    {product.stock <= 0
                      ? "SIN STOCK"
                      : `Stock disponible: ${product.stock}`}
                  </p>
                </div>

                <button
                  type="button"
                  disabled={product.stock <= 0}
                  onClick={() =>
                    addProduct(product)
                  }
                  className="shrink-0 rounded-full bg-pine px-4 py-2 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Agregar
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* ----------------------------------------------------
            DETALLE DEL CARRITO
        ----------------------------------------------------- */}

        <div className="rounded-3xl border border-line bg-card p-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">
              Detalle
            </h2>

            {cart.length > 0 && (
              <span className="rounded-full bg-paper px-3 py-1 text-xs font-semibold text-ink/60">
                {cart.length} producto
                {cart.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {cart.length === 0 && (
            <p className="mt-3 text-sm text-ink/50">
              Aún no hay productos.
            </p>
          )}

          <ul className="mt-3 space-y-3">
            {cart.map((item) => (
              <li
                key={item.product.id}
                className="rounded-2xl border border-line bg-paper p-3"
              >
                <div className="flex items-center gap-3">
                  {/* Producto */}
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">
                      {item.product.name}
                    </p>

                    <p className="text-xs text-ink/50">
                      {item.product.code} · S/{" "}
                      {Number(
                        item.product.price,
                      ).toFixed(2)}{" "}
                      c/u
                    </p>

                    <p className="mt-1 text-xs text-ink/40">
                      Stock máximo:{" "}
                      {item.product.stock}
                    </p>
                  </div>

                  {/* Cantidad */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      disabled={item.quantity <= 1}
                      className="h-8 w-8 rounded-full border border-line font-bold hover:bg-line disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() =>
                        setQty(
                          item.product.id,
                          item.quantity - 1,
                        )
                      }
                    >
                      −
                    </button>

                    <input
                      type="number"
                      min={1}
                      max={item.product.stock}
                      inputMode="numeric"
                      className="w-16 rounded-lg border border-line bg-card px-2 py-1 text-center"
                      value={
                        editingQty[
                          item.product.id
                        ] ??
                        String(item.quantity)
                      }
                      onFocus={() => {
                        setEditingQty(
                          (current) => ({
                            ...current,
                            [item.product.id]:
                              String(
                                item.quantity,
                              ),
                          }),
                        );
                      }}
                      onChange={(event) => {
                        setEditingQty(
                          (current) => ({
                            ...current,
                            [item.product.id]:
                              event.target.value,
                          }),
                        );
                      }}
                      onBlur={() => {
                        const value =
                          editingQty[
                            item.product.id
                          ];

                        // Si el usuario dejó vacío,
                        // volvemos a la cantidad anterior.
                        if (!value) {
                          setEditingQty(
                            (current) => ({
                              ...current,
                              [item.product.id]:
                                String(
                                  item.quantity,
                                ),
                            }),
                          );

                          return;
                        }

                        const numericValue =
                          Number(value);

                        if (
                          !Number.isFinite(
                            numericValue,
                          ) ||
                          numericValue < 1
                        ) {
                          setEditingQty(
                            (current) => ({
                              ...current,
                              [item.product.id]:
                                String(
                                  item.quantity,
                                ),
                            }),
                          );

                          return;
                        }

                        setQty(
                          item.product.id,
                          numericValue,
                        );

                        setEditingQty(
                          (current) => {
                            const next = {
                              ...current,
                            };

                            delete next[
                              item.product.id
                            ];

                            return next;
                          },
                        );
                      }}
                    />

                    <button
                      type="button"
                      disabled={
                        item.quantity >=
                        item.product.stock
                      }
                      className="h-8 w-8 rounded-full border border-line font-bold hover:bg-line disabled:cursor-not-allowed disabled:opacity-40"
                      onClick={() =>
                        setQty(
                          item.product.id,
                          item.quantity + 1,
                        )
                      }
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="w-24 text-right font-semibold">
                    S/{" "}
                    {(
                      item.product.price *
                      item.quantity
                    ).toFixed(2)}
                  </span>

                  {/* Eliminar producto */}
                  <button
                    type="button"
                    title="Eliminar producto"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-clay hover:bg-clay/10"
                    onClick={() =>
                      removeFromCart(
                        item.product.id,
                      )
                    }
                  >
                    ×
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {/* Total */}
          <div className="mt-5 border-t border-line pt-4">
            <p className="text-right text-sm text-ink/50">
              Total
            </p>

            <p className="text-right font-display text-3xl">
              S/ {total.toFixed(2)}
            </p>
          </div>
        </div>
      </section>

      {/* ======================================================
          COLUMNA DERECHA
      ======================================================= */}

      <section className="space-y-4">
        {/* COMPROBANTE */}

        <div className="rounded-3xl border border-line bg-card p-5">
          <h2 className="font-display text-2xl">
            Comprobante
          </h2>

          <div className="mt-3 flex gap-2">
            {(["BOLETA", "FACTURA"] as ReceiptType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() =>
                    changeReceiptType(type)
                  }
                  className={`rounded-full px-4 py-2 ${
                    receiptType === type
                      ? "bg-pine text-white"
                      : "border border-line"
                  }`}
                >
                  {type}
                </button>
              ),
            )}
          </div>

          {/* BOLETA */}

          {receiptType === "BOLETA" && (
            <div className="mt-4 space-y-3">
              <label className="block text-sm font-medium">
                Documento
              </label>

              <select
                className="w-full rounded-xl border border-line bg-paper px-3 py-2"
                value={boletaMode}
                onChange={(event) =>
                  setBoletaMode(
                    event.target
                      .value as BoletaDocumentMode,
                  )
                }
              >
                <option value="NONE">
                  Sin documento
                </option>

                <option value="DNI">
                  DNI
                </option>
              </select>

              {boletaMode === "DNI" && (
                <>
                  <input
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2"
                    placeholder="DNI (8 dígitos)"
                    inputMode="numeric"
                    maxLength={8}
                    value={documentNumber}
                    onChange={(event) =>
                      setDocumentNumber(
                        event.target.value.replace(
                          /\D/g,
                          "",
                        ),
                      )
                    }
                  />

                  <input
                    className="w-full rounded-xl border border-line bg-paper px-3 py-2"
                    placeholder="Nombre"
                    value={customerName}
                    onChange={(event) =>
                      setCustomerName(
                        event.target.value,
                      )
                    }
                  />
                </>
              )}
            </div>
          )}

          {/* FACTURA */}

          {receiptType === "FACTURA" && (
            <div className="mt-4 space-y-3">
              <input
                className="w-full rounded-xl border border-line bg-paper px-3 py-2"
                placeholder="RUC (11 dígitos)"
                inputMode="numeric"
                maxLength={11}
                value={ruc}
                onChange={(event) =>
                  setRuc(
                    event.target.value.replace(
                      /\D/g,
                      "",
                    ),
                  )
                }
              />

              <input
                className="w-full rounded-xl border border-line bg-paper px-3 py-2"
                placeholder="Razón social"
                value={businessName}
                onChange={(event) =>
                  setBusinessName(
                    event.target.value,
                  )
                }
              />
            </div>
          )}
        </div>

        {/* CLIENTE- */}

        <div className="rounded-3xl border border-line bg-card p-5">
          <h2 className="font-display text-2xl">
            Cliente (opcional)
          </h2>

          <div className="mt-3 flex gap-2">
            <input
              className="flex-1 rounded-full border border-line bg-paper px-4 py-2"
              placeholder="Buscar cliente"
              value={customerQuery}
              onChange={(event) =>
                setCustomerQuery(
                  event.target.value,
                )
              }
            />

            <button
              type="button"
              onClick={searchCustomers}
              className="rounded-full border border-line px-4"
            >
              Buscar
            </button>
          </div>

          <ul className="mt-2 space-y-1 text-sm">
            {customers.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className="text-left text-pine hover:underline"
                  onClick={() =>
                    selectCustomer(c)
                  }
                >
                  {c.name} · {c.documentType}{" "}
                  {c.documentNumber}
                </button>
              </li>
            ))}
          </ul>

          {customer && (
            <div className="mt-3 rounded-xl bg-paper p-3 text-sm">
              <p className="font-semibold">
                Cliente seleccionado
              </p>

              <p className="text-ink/60">
                {customer.name}
              </p>

              <p className="text-ink/50">
                {customer.documentType}{" "}
                {customer.documentNumber}
              </p>
            </div>
          )}
        </div>

        {/* ERROR*/}

        {error && (
          <div className="rounded-2xl border border-clay/20 bg-clay/5 p-3 text-sm text-clay">
            {error}
          </div>
        )}

        {/* ----------------------------------------------------
            CONFIRMAR VENTA
        ----------------------------------------------------- */}

        <button
          type="submit"
          disabled={
            cart.length === 0 ||
            isSubmitting
          }
          className="w-full rounded-full bg-clay py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Registrando venta..."
            : "Confirmar venta"}
        </button>
      </section>
    </form>
  );
}