--
-- PostgreSQL database dump
--

\restrict Ip3fC2QG3rFfYe38DoBba9X0iR0PXl59ftmrBWe78km9wFySVE40C3wsZpO38ss

-- Dumped from database version 15.17
-- Dumped by pg_dump version 15.17

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: categories; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.categories (
    id uuid NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    parent_category_id uuid,
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 0
);


ALTER TABLE public.categories OWNER TO ecommerce_user;

--
-- Name: flyway_schema_history; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.flyway_schema_history (
    installed_rank integer NOT NULL,
    version character varying(50),
    description character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    script character varying(1000) NOT NULL,
    checksum integer,
    installed_by character varying(100) NOT NULL,
    installed_on timestamp without time zone DEFAULT now() NOT NULL,
    execution_time integer NOT NULL,
    success boolean NOT NULL
);


ALTER TABLE public.flyway_schema_history OWNER TO ecommerce_user;

--
-- Name: inventory; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.inventory (
    product_id uuid NOT NULL,
    quantity_available integer DEFAULT 0 NOT NULL,
    reserved_quantity integer DEFAULT 0 NOT NULL,
    last_updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 0
);


ALTER TABLE public.inventory OWNER TO ecommerce_user;

--
-- Name: products; Type: TABLE; Schema: public; Owner: ecommerce_user
--

CREATE TABLE public.products (
    id uuid NOT NULL,
    category_id uuid NOT NULL,
    name character varying(255) NOT NULL,
    sku character varying(100) NOT NULL,
    description text,
    price numeric(19,4) NOT NULL,
    status character varying(50) NOT NULL,
    image_url character varying(500),
    is_deleted boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    version integer DEFAULT 0
);


ALTER TABLE public.products OWNER TO ecommerce_user;

--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: ecommerce_user
--

COPY public.categories (id, name, description, parent_category_id, is_deleted, created_at, updated_at, version) FROM stdin;
123e4567-e89b-12d3-a456-426614174000	Electronics	Electronics category	\N	f	2026-10-06 09:57:02.11073+00	2026-10-06 09:57:02.11073+00	0
\.


--
-- Data for Name: flyway_schema_history; Type: TABLE DATA; Schema: public; Owner: ecommerce_user
--

COPY public.flyway_schema_history (installed_rank, version, description, type, script, checksum, installed_by, installed_on, execution_time, success) FROM stdin;
1	1	init product schema	SQL	V1__init_product_schema.sql	-3885215	ecommerce_user	2026-10-05 11:55:55.291916	265	t
\.


--
-- Data for Name: inventory; Type: TABLE DATA; Schema: public; Owner: ecommerce_user
--

COPY public.inventory (product_id, quantity_available, reserved_quantity, last_updated_at, version) FROM stdin;
123e4567-e89b-12d3-a456-426614174001	99	0	2026-10-06 12:33:43.537114+00	1
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: ecommerce_user
--

COPY public.products (id, category_id, name, sku, description, price, status, image_url, is_deleted, created_at, updated_at, version) FROM stdin;
123e4567-e89b-12d3-a456-426614174001	123e4567-e89b-12d3-a456-426614174000	Smartphone	SKU-001	Smart phone description	999.9900	ACTIVE	\N	f	2026-10-06 09:57:02.988976+00	2026-10-06 09:57:02.988976+00	0
\.


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history flyway_schema_history_pk; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.flyway_schema_history
    ADD CONSTRAINT flyway_schema_history_pk PRIMARY KEY (installed_rank);


--
-- Name: inventory inventory_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_pkey PRIMARY KEY (product_id);


--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: flyway_schema_history_s_idx; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX flyway_schema_history_s_idx ON public.flyway_schema_history USING btree (success);


--
-- Name: idx_product_category; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_product_category ON public.products USING btree (category_id);


--
-- Name: idx_product_status; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE INDEX idx_product_status ON public.products USING btree (status);


--
-- Name: uq_category_name; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE UNIQUE INDEX uq_category_name ON public.categories USING btree (name) WHERE (is_deleted = false);


--
-- Name: uq_product_sku; Type: INDEX; Schema: public; Owner: ecommerce_user
--

CREATE UNIQUE INDEX uq_product_sku ON public.products USING btree (sku) WHERE (is_deleted = false);


--
-- Name: categories categories_parent_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_parent_category_id_fkey FOREIGN KEY (parent_category_id) REFERENCES public.categories(id);


--
-- Name: inventory inventory_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.inventory
    ADD CONSTRAINT inventory_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: products products_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: ecommerce_user
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id);


--
-- PostgreSQL database dump complete
--

\unrestrict Ip3fC2QG3rFfYe38DoBba9X0iR0PXl59ftmrBWe78km9wFySVE40C3wsZpO38ss

